import { SolanaWebIdeError, type Diagnostic } from '@solana-web-ide/shared';

export function compileFailed(diagnostics: Diagnostic[], cause?: unknown): SolanaWebIdeError {
    return new SolanaWebIdeError('Compilation failed', {
        code: 'COMPILE_FAILED',
        cause,
        context: {
            diagnosticCount: diagnostics.length,
            firstMessage: diagnostics[0]?.message,
        },
    });
}

export function compileTimeout(runId: string, timeoutMs: number): SolanaWebIdeError {
    return new SolanaWebIdeError(`Compile timed out after ${timeoutMs}ms`, {
        code: 'COMPILE_TIMEOUT',
        context: { runId, timeoutMs },
    });
}

export function invalidCompileRequest(reason: string): SolanaWebIdeError {
    return new SolanaWebIdeError(`Invalid compile request: ${reason}`, {
        code: 'INVALID_INPUT',
        context: { reason },
    });
}