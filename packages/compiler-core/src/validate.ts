import { SolanaWebIdeError } from '@solana-web-ide/shared';
import type { CompileRequest } from './types.js';

/**
 * Validate a compile request. Throws SolanaWebIdeError with code INVALID_INPUT
 * if the request is malformed. Returns the request unchanged on success so
 * callers can chain.
 */
export function validateCompileRequest(request: CompileRequest): CompileRequest {
    if (!request.runId || typeof request.runId !== 'string') {
        throw invalid('runId must be a non-empty string');
    }
    if (!request.manifestPath || typeof request.manifestPath !== 'string') {
        throw invalid('manifestPath must be a non-empty string');
    }
    if (request.manifestPath.startsWith('/') || request.manifestPath.includes('..')) {
        throw invalid('manifestPath must be a project-relative path without traversal');
    }
    if (!request.files || typeof request.files !== 'object') {
        throw invalid('files must be an object');
    }
    const fileCount = Object.keys(request.files).length;
    if (fileCount === 0) {
        throw invalid('files must contain at least one entry');
    }
    if (!request.files[request.manifestPath]) {
        throw invalid(`manifestPath "${request.manifestPath}" not found in files`);
    }
    return request;
}

function invalid(reason: string): SolanaWebIdeError {
    return new SolanaWebIdeError(`Invalid compile request: ${reason}`, {
        code: 'INVALID_INPUT',
        context: { reason },
    });
}