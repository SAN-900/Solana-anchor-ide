/** Maximum data per write-data transaction (leaves room for headers). */
const CHUNK_SIZE = 900;

/**
 * Split a program binary into 900-byte chunks for BPFLoaderUpgradeable write_data calls.
 */
export function chunkProgram(programBytes: Uint8Array): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let offset = 0; offset < programBytes.length; offset += CHUNK_SIZE) {
    chunks.push(programBytes.slice(offset, offset + CHUNK_SIZE));
  }
  return chunks;
}

/** Decode a base64-encoded .so binary to bytes. */
export function decodeProgram(soBase64: string): Uint8Array {
  const binary = atob(soBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
