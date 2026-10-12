export interface BuildRequest {
    manifestPath: string;
    files: Record<string, string>;
    cluster: 'localnet' | 'devnet' | 'mainnet-beta';
}

export interface BuildResponse {
    ok: boolean;
    programSoBase64?: string;
    idl?: unknown | null;
    diagnostics: WireDiagnostic[];
    durationMs: number;
}

export interface WireDiagnostic {
    severity: 'error' | 'warning' | 'info';
    message: string;
    file: string;
    line?: number;
    column?: number;
    code?: string;
}