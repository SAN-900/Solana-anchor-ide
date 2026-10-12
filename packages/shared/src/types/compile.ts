import type { Diagnostic } from './diagnostics.js';

export interface CompileInput {
    /** Project-relative path to the Anchor.toml or Cargo.toml */
    manifestPath: string;
    /** All source files, keyed by project-relative path */
    files: Record<string, string>;
}

export interface CompileOutput {
    ok: boolean;
    /** Base64-encoded SBF/BPF shared object, present on success */
    programSoBase64?: string;
    /** Anchor IDL v1 JSON, if the program is an Anchor program */
    idl?: unknown;
    /** All diagnostics emitted during compilation */
    diagnostics: Diagnostic[];
    /** Which backend produced this result */
    backend: 'remote' | 'wasm';
    /** Wall-clock duration in milliseconds */
    durationMs: number;
}