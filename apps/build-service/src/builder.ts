import { mkdtemp, writeFile, mkdir, readFile, rm, readdir } from 'node:fs/promises';
import { spawn, type ChildProcess } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import type { BuildRequest, BuildResponse, WireDiagnostic } from './types.js';
import { parseRustDiagnostics } from './diagnostics.js';

const BUILDER_IMAGE = process.env.BUILDER_IMAGE ?? 'solana-web-ide-builder:latest';
const BUILD_TIMEOUT_MS = 5 * 60 * 1000;

// Named Docker volumes that persist the Cargo registry and incremental target
// artifacts across builds. First warm build populates them; subsequent builds
// skip re-downloading crates and re-compiling unchanged crates.
const CARGO_CACHE_VOLUME = process.env.CARGO_CACHE_VOLUME ?? 'solana-cargo-cache';
const TARGET_CACHE_VOLUME = process.env.TARGET_CACHE_VOLUME ?? 'solana-target-cache';

// -----------------------
// Public API
// -----------------------

export async function buildProject(req: BuildRequest): Promise<BuildResponse> {
    const t0 = Date.now();
    const workdir = await mkdtemp(join(tmpdir(), 'swi-build-'));

    try {
        await materializeProject(workdir, req.files);
        const { exitCode, stderr } = await runDocker(workdir);
        return await assembleResponse(workdir, req, exitCode, stderr, t0);
    } finally {
        await rm(workdir, { recursive: true, force: true }).catch(() => { });
    }
}

/**
 * Streaming variant used by the SSE endpoint.
 * Calls `onLine` for each line of Docker stderr as it arrives, then
 * resolves with the final BuildResponse when the container exits.
 */
export async function buildProjectStreaming(
    req: BuildRequest,
    onLine: (line: string) => void,
): Promise<BuildResponse> {
    const t0 = Date.now();
    const workdir = await mkdtemp(join(tmpdir(), 'swi-build-'));

    try {
        await materializeProject(workdir, req.files);
        const { exitCode, stderr } = await runDockerStreaming(workdir, onLine);
        return await assembleResponse(workdir, req, exitCode, stderr, t0);
    } finally {
        await rm(workdir, { recursive: true, force: true }).catch(() => { });
    }
}

// -----------------------
// Project materialisation
// -----------------------

async function materializeProject(
    workdir: string,
    files: Record<string, string>,
): Promise<void> {
    for (const [path, content] of Object.entries(files)) {
        const full = join(workdir, path);
        await mkdir(dirname(full), { recursive: true });
        await writeFile(full, content, 'utf8');
    }
}

// -----------------------
// Result assembly
// -----------------------

async function assembleResponse(
    workdir: string,
    req: BuildRequest,
    exitCode: number,
    stderr: string,
    t0: number,
): Promise<BuildResponse> {
    const diagnostics: WireDiagnostic[] = parseRustDiagnostics(stderr);
    const ok = exitCode === 0;

    if (!ok) {
        if (diagnostics.length === 0) {
            diagnostics.push({
                severity: 'error',
                message: stderr.slice(-4000).trim() || 'anchor build failed',
                file: req.manifestPath,
            });
        }
        return { ok: false, diagnostics, durationMs: Date.now() - t0 };
    }

    const programName = await findProgramName(workdir, req.manifestPath);
    const soPath = join(workdir, 'target', 'deploy', `${programName}.so`);
    const idlPath = join(workdir, 'target', 'idl', `${programName}.json`);

    let soBase64: string;
    try {
        const so = await readFile(soPath);
        soBase64 = so.toString('base64');
    } catch {
        diagnostics.push({
            severity: 'error',
            message: `Build succeeded but ${programName}.so was not produced`,
            file: req.manifestPath,
        });
        return { ok: false, diagnostics, durationMs: Date.now() - t0 };
    }

    let idl: unknown | null = null;
    try {
        idl = JSON.parse(await readFile(idlPath, 'utf8'));
    } catch {
        // IDL is optional — non-Anchor Rust programs produce no IDL.
    }

    return {
        ok: true,
        programSoBase64: soBase64,
        idl,
        diagnostics,
        durationMs: Date.now() - t0,
    };
}

// -----------------------
// Docker helpers
// -----------------------

interface DockerResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

/**
 * Build the Docker args array.
 *
 * Cache mounts:
 *   CARGO_CACHE_VOLUME  -> /root/.cargo   (registry + git sources)
 *   TARGET_CACHE_VOLUME -> /root/target   (incremental Rust artifacts)
 *
 * The target dir inside the container is mapped to /root/target and
 * pointed at via CARGO_TARGET_DIR so anchor/cargo writes there instead
 * of the work dir.  This keeps the shared volume's layout stable across
 * different project names.
 */
function buildDockerArgs(workdir: string): string[] {
    return [
        'run', '--rm',
        '--network', 'bridge',
        '--memory', '2g',
        '--cpus', '2',
        // Project source (ephemeral, per-build temp dir)
        '-v', `${workdir}:/work`,
        // Persistent Cargo registry — avoids re-downloading crates
        '-v', `${CARGO_CACHE_VOLUME}:/root/.cargo`,
        // Persistent incremental target dir — avoids recompiling unchanged crates
        '-v', `${TARGET_CACHE_VOLUME}:/root/target`,
        // Tell Cargo/Anchor to use the shared target volume
        '-e', 'CARGO_TARGET_DIR=/root/target',
        '-w', '/work',
        BUILDER_IMAGE,
        // Run as a shell so we can copy artifacts back to /work after build.
        // CARGO_TARGET_DIR points to the shared persistent volume (/root/target)
        // for fast incremental rebuilds, but the host reads artifacts from
        // the bind-mounted workdir (/work/target). We copy only the small
        // deploy outputs — not the full multi-GB target dir.
        '/bin/bash', '-c',
        [
            'anchor build',
            'mkdir -p /work/target/deploy /work/target/idl',
            'cp /root/target/deploy/*.so  /work/target/deploy/ 2>/dev/null || true',
            'cp /root/target/idl/*.json   /work/target/idl/   2>/dev/null || true',
        ].join(' && '),
    ];
}

function spawnDocker(workdir: string): ChildProcess {
    return spawn('docker', buildDockerArgs(workdir), {
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

function runDocker(workdir: string): Promise<DockerResult> {
    return new Promise((resolve, reject) => {
        const child = spawnDocker(workdir);

        let stdout = '';
        let stderr = '';
        child.stdout?.on('data', (c: Buffer) => { stdout += c.toString(); });
        child.stderr?.on('data', (c: Buffer) => { stderr += c.toString(); });

        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            reject(new Error(`Build exceeded ${BUILD_TIMEOUT_MS}ms`));
        }, BUILD_TIMEOUT_MS);

        child.on('error', (err) => { clearTimeout(timer); reject(err); });
        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ exitCode: code ?? -1, stdout, stderr });
        });
    });
}

/**
 * Like runDocker but emits each line of stderr to onLine as it arrives.
 * The full stderr is still accumulated so diagnostics can be parsed after exit.
 */
function runDockerStreaming(
    workdir: string,
    onLine: (line: string) => void,
): Promise<DockerResult> {
    return new Promise((resolve, reject) => {
        const child = spawnDocker(workdir);

        let stdout = '';
        let stderr = '';
        let stderrBuf = '';

        child.stdout?.on('data', (c: Buffer) => { stdout += c.toString(); });

        child.stderr?.on('data', (c: Buffer) => {
            const chunk = c.toString();
            stderr += chunk;
            stderrBuf += chunk;

            // Emit complete lines immediately so the client sees progress.
            const lines = stderrBuf.split('\n');
            // Last element may be an incomplete line — keep it in the buffer.
            stderrBuf = lines.pop() ?? '';
            for (const line of lines) {
                if (line.trim()) onLine(line);
            }
        });

        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            reject(new Error(`Build exceeded ${BUILD_TIMEOUT_MS}ms`));
        }, BUILD_TIMEOUT_MS);

        child.on('error', (err) => { clearTimeout(timer); reject(err); });
        child.on('close', (code) => {
            clearTimeout(timer);
            // Flush any remaining partial line.
            if (stderrBuf.trim()) onLine(stderrBuf);
            resolve({ exitCode: code ?? -1, stdout, stderr });
        });
    });
}

// -----------------------
// Utilities
// -----------------------

async function findProgramName(workdir: string, manifestPath: string): Promise<string> {
    try {
        const programsDir = join(workdir, 'programs');
        const entries = await readdir(programsDir, { withFileTypes: true });
        const dir = entries.find((e) => e.isDirectory());
        if (dir) return dir.name;
    } catch {
        // Fall through.
    }
    return manifestPath.split('/')[0] ?? 'program';
}