import { mkdtemp, writeFile, mkdir, readFile, rm, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import type { BuildRequest, BuildResponse, WireDiagnostic } from './types.js';
import { parseRustDiagnostics } from './diagnostics.js';

const BUILDER_IMAGE = process.env.BUILDER_IMAGE ?? 'solana-web-ide-builder:latest';
const BUILD_TIMEOUT_MS = 5 * 60 * 1000;

export async function buildProject(req: BuildRequest): Promise<BuildResponse> {
    const t0 = Date.now();
    const workdir = await mkdtemp(join(tmpdir(), 'swi-build-'));

    try {
        // Materialize the project.
        for (const [path, content] of Object.entries(req.files)) {
            const full = join(workdir, path);
            await mkdir(dirname(full), { recursive: true });
            await writeFile(full, content, 'utf8');
        }

        // Run `anchor build` inside the container.
        const { exitCode, stdout, stderr } = await runDocker(workdir);

        const diagnostics: WireDiagnostic[] = parseRustDiagnostics(stderr);
        const ok = exitCode === 0;

        if (!ok) {
            // If cargo failed but we got no structured diagnostics, surface raw stderr.
            if (diagnostics.length === 0) {
                diagnostics.push({
                    severity: 'error',
                    message: stderr.slice(-4000).trim() || 'anchor build failed',
                    file: req.manifestPath,
                });
            }
            return { ok: false, diagnostics, durationMs: Date.now() - t0 };
        }

        // Locate the produced .so and IDL.
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
            // IDL is optional — a non-Anchor Rust program produces no IDL.
        }

        return {
            ok: true,
            programSoBase64: soBase64,
            idl,
            diagnostics,
            durationMs: Date.now() - t0,
        };
    } finally {
        // Best-effort cleanup. Failures here should not mask build results.
        await rm(workdir, { recursive: true, force: true }).catch(() => { });
    }
}

interface DockerResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

function runDocker(workdir: string): Promise<DockerResult> {
    return new Promise((resolve, reject) => {
        const child = spawn(
            'docker',
            [
                'run', '--rm',
                '--network', 'bridge',
                '--memory', '2g',
                '--cpus', '2',
                '-v', `${workdir}:/work`,
                '-w', '/work',
                BUILDER_IMAGE,
                'anchor', 'build',
            ],
            { stdio: ['ignore', 'pipe', 'pipe'] },
        );

        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (c) => { stdout += c.toString(); });
        child.stderr.on('data', (c) => { stderr += c.toString(); });

        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            reject(new Error(`Build exceeded ${BUILD_TIMEOUT_MS}ms`));
        }, BUILD_TIMEOUT_MS);

        child.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });

        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ exitCode: code ?? -1, stdout, stderr });
        });
    });
}

async function findProgramName(workdir: string, manifestPath: string): Promise<string> {
    // Fast path: read programs/<name>/Cargo.toml from the materialized project.
    try {
        const programsDir = join(workdir, 'programs');
        const entries = await readdir(programsDir, { withFileTypes: true });
        const dir = entries.find((e) => e.isDirectory());
        if (dir) return dir.name;
    } catch {
        // Fall through.
    }
    // Last resort: derive from the manifest path.
    return manifestPath.split('/')[0] ?? 'program';
}