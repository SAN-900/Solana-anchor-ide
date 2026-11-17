import type { WireDiagnostic } from './types.js';

const HEADER = /^(error|warning|info)(?:\[([A-Z0-9]+)\])?:\s*(.+)$/;
const LOCATION = /^\s*-->\s*([^:]+):(\d+):(\d+)/;

/**
 * Parse Rust compiler output into structured diagnostics.
 * Handles the standard format emitted by cargo. Multi-line messages
 * are truncated to the header line; the full text is preserved in
 * the message field for display in the IDE.
 */
export function parseRustDiagnostics(stderr: string): WireDiagnostic[] {
    const lines = stderr.split(/\r?\n/);
    const out: WireDiagnostic[] = [];
    let current: WireDiagnostic | null = null;

    for (const line of lines) {
        const header = line.match(HEADER);
        if (header && header[1] && header[3]) {
            if (current) out.push(current);
            current = {
                severity: header[1] === 'info' ? 'info' : (header[1] as 'error' | 'warning'),
                code: header[2],
                message: header[3].trim(),
                file: '',
            };
            continue;
        }

        const loc = line.match(LOCATION);
        if (loc && loc[1] && loc[2] && loc[3] && current) {
            current.file = loc[1].trim();
            current.line = Number.parseInt(loc[2], 10);
            current.column = Number.parseInt(loc[3], 10);
            continue;
        }

        if (current && line.trim().length > 0) {
            // Append continuation lines (source snippet, hint, note).
            current.message += '\n' + line.trimEnd();
        }
    }

    if (current) out.push(current);

    // Drop diagnostics that never got a file association — these are
    // usually cargo-level summaries rather than code issues.
    return out.filter((d) => d.file.length > 0 || d.severity === 'error');
}