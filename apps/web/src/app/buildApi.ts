import type { CompileResult, CompileRequest } from '@solana-web-ide/compiler-core';
import type { Diagnostic } from '@solana-web-ide/shared';

interface WireDiagnostic {
    severity: 'error' | 'warning' | 'info';
    message: string;
    file: string;
    line?: number;
    column?: number;
    code?: string;
}

interface WireResponse {
    ok: boolean;
    programSoBase64?: string;
    idl?: unknown | null;
    diagnostics: WireDiagnostic[];
    durationMs: number;
}

export async function compileRemote(req: CompileRequest): Promise<CompileResult> {
    const t0 = performance.now();
    const res = await fetch('/build-api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            manifestPath: req.manifestPath,
            cluster: req.cluster,
            files: req.files,
        }),
    });

    if (!res.ok) {
        return {
            ok: false,
            runId: req.runId,
            backend: 'remote',
            durationMs: performance.now() - t0,
            diagnostics: [{
                severity: 'error',
                message: `Build service returned HTTP ${res.status}`,
                file: req.manifestPath,
            }],
        };
    }

    const wire = (await res.json()) as WireResponse;
    const diagnostics: Diagnostic[] = wire.diagnostics.map((d) => ({
        severity: d.severity,
        message: d.message,
        file: d.file,
        code: d.code,
        span: d.line !== undefined ? {
            line: d.line,
            column: d.column ?? 1,
            offset: 0,
            length: 0,
        } : undefined,
    }));

    if (wire.ok && wire.programSoBase64) {
        return {
            ok: true,
            runId: req.runId,
            backend: 'remote',
            durationMs: wire.durationMs,
            programSoBase64: wire.programSoBase64,
            idl: wire.idl ?? null,
            diagnostics,
        };
    }

    return {
        ok: false,
        runId: req.runId,
        backend: 'remote',
        durationMs: wire.durationMs,
        diagnostics: diagnostics.length > 0 ? diagnostics : [{
            severity: 'error',
            message: 'Build failed with no diagnostics',
            file: req.manifestPath,
        }],
    };
}