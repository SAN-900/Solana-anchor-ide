export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface SourceSpan {
    /** 1-based line number */
    line: number;
    /** 1-based column number */
    column: number;
    /** 0-based byte offset into the source */
    offset: number;
    /** Length in bytes */
    length: number;
}

export interface Diagnostic {
    severity: DiagnosticSeverity;
    message: string;
    /** Absolute path within the virtual filesystem, e.g. "programs/counter/src/lib.rs" */
    file: string;
    span?: SourceSpan;
    /** Stable identifier for programmatic handling, e.g. "ANCHOR_MISSING_CONSTRAINT" */
    code?: string;
}

export function isError(d: Diagnostic): boolean {
    return d.severity === 'error';
}