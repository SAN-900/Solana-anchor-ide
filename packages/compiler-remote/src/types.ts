export interface RemoteCompilerConfig {
  /** Base URL of the build-service, e.g. http://localhost:8788 */
  baseUrl: string;
  /** Abort timeout in ms. Default: 120_000 (2 min) */
  timeoutMs?: number;
  /** Max retry attempts on network errors. Default: 2 */
  maxRetries?: number;
}
