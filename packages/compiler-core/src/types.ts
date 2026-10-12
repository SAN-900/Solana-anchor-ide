import type { Diagnostic } from '@solana-web-ide/shared';

export interface CompileRequest {
    /** A unique ID for this compile run. Used for cancellation and logging. */
    runId: string;
    /** Project-relative path to the workspace manifest, e.g. "Anchor.toml" */
    manifestPath: string;
    /** All files in the project, keyed by project-relative path */
    files: Record<string, string>;
    /** Which cluster the compile is targeting. Affects feature flags. */
    cluster: 'localnet' | 'devnet' | 'mainnet-beta';
}

export interface CompileSuccess {
    ok: true;
    runId: string;
    /** Base64-encoded SBF/BPF shared object */
    programSoBase64: string;
    /** Anchor IDL v1 JSON, if the program is an Anchor program */
    idl: unknown | null;
    /** All diagnostics emitted during compilation, including warnings */
    diagnostics: Diagnostic[];
    /** Which backend produced this result */
    backend: CompileBackendKind;
    /** Wall-clock duration in milliseconds */
    durationMs: number;
}

export interface CompileFailure {
    ok: false;
    runId: string;
    /** Diagnostics explaining the failure. At least one entry with severity 'error'. */
    diagnostics: Diagnostic[];
    backend: CompileBackendKind;
    durationMs: number;
}

export type CompileResult = CompileSuccess | CompileFailure;

export type CompileBackendKind = 'remote' | 'wasm';

/**
 * A compilation backend. Implementations: compiler-remote (network),
 * compiler-wasm (in-browser WASM).
 */
export interface CompilerBackend {
    readonly kind: CompileBackendKind;

    /**
     * Compile a project. Must be cancellation-safe: if the AbortSignal fires,
     * the promise rejects with a SolanaWebIdeError with code 'COMPILE_TIMEOUT'.
     */
    compile(request: CompileRequest, signal?: AbortSignal): Promise<CompileResult>;

    /**
     * Optional capability probe. Backends that cannot run in the current
     * environment (e.g. WASM backend without SIMD support) should return false.
     * The UI uses this to pick a backend at startup.
     */
    isAvailable(): Promise<boolean>;
}