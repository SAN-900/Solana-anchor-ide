export interface ProgramKeypair {
  /** Human label, e.g. "counter" */
  name: string;
  /** Base58 public key */
  publicKey: string;
  /** Base64-encoded secret key (stored encrypted in production) */
  secretKeyBase64: string;
  createdAt: number;
}
