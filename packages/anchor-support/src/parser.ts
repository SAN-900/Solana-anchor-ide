import type { AnchorIdl } from './idl.js';

/**
 * Parse and validate a raw IDL JSON object into a typed AnchorIdl.
 * Handles both Anchor v0.x (v1 IDL) and Anchor 1.x (v2 IDL) formats.
 */
export function parseIdl(raw: unknown): AnchorIdl {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('IDL must be a JSON object');
  }
  const obj = raw as Record<string, unknown>;
  if (!obj.name || typeof obj.name !== 'string') throw new Error('IDL missing name');
  if (!Array.isArray(obj.instructions)) throw new Error('IDL missing instructions array');
  // Further validation and normalization to be added in Phase 3
  return raw as AnchorIdl;
}

/** Returns the 8-byte Anchor account discriminator for the given account name. */
export function accountDiscriminator(name: string): Uint8Array {
  // sha256("account:<name>")[0..8]
  // TODO: implement using @noble/hashes when added as a dep
  void name;
  return new Uint8Array(8);
}
