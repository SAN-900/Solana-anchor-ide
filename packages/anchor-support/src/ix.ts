import type { AnchorIdlInstruction, AnchorIdlType } from './idl.js';

/**
 * Encode instruction arguments according to Anchor's borsh layout.
 * Returns the data buffer (8-byte discriminator + borsh-encoded args).
 */
export function encodeIxData(
  _ix: AnchorIdlInstruction,
  _args: Record<string, unknown>,
): Uint8Array {
  // TODO: implement borsh encoding in Phase 3
  return new Uint8Array(0);
}

/** Human-readable label for an IDL type. */
export function typeLabel(type: AnchorIdlType): string {
  if (typeof type === 'string') return type;
  if ('vec' in type) return `Vec<${typeLabel(type.vec)}>`;
  if ('option' in type) return `Option<${typeLabel(type.option)}>`;
  if ('defined' in type) return type.defined;
  if ('array' in type) return `[${typeLabel(type.array[0])}; ${type.array[1]}]`;
  return 'unknown';
}
