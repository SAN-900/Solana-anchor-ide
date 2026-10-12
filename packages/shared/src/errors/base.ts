export type ErrorCode =
    | 'COMPILE_FAILED'
    | 'COMPILE_TIMEOUT'
    | 'RPC_UNAVAILABLE'
    | 'RPC_INVALID_RESPONSE'
    | 'WALLET_NOT_CONNECTED'
    | 'WALLET_REJECTED'
    | 'DEPLOY_FAILED'
    | 'VFS_NOT_FOUND'
    | 'VFS_WRITE_FAILED'
    | 'INVALID_INPUT'
    | 'INTERNAL';

export interface SolanaWebIdeErrorOptions {
    code: ErrorCode;
    cause?: unknown;
    /** Additional structured context for logging and UI display */
    context?: Record<string, unknown>;
}

export class SolanaWebIdeError extends Error {
    readonly code: ErrorCode;
    readonly context: Record<string, unknown>;

    constructor(message: string, options: SolanaWebIdeErrorOptions) {
        super(message, { cause: options.cause });
        this.name = 'SolanaWebIdeError';
        this.code = options.code;
        this.context = options.context ?? {};
    }

    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            context: this.context,
        };
    }
}