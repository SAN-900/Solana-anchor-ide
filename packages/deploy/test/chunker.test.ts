import { describe, it, expect } from 'vitest';
import { chunkProgram, decodeProgram } from '../src/index.js';

describe('deploy chunker', () => {
  it('chunks byte array accurately at 900 bytes', () => {
    const data = new Uint8Array(2000);
    const chunks = chunkProgram(data);
    expect(chunks.length).toBe(3);
    expect(chunks[0]!.length).toBe(900);
    expect(chunks[1]!.length).toBe(900);
    expect(chunks[2]!.length).toBe(200);
  });

  it('decodes base64 string to Uint8Array', () => {
    const base64 = btoa('hello solana');
    const bytes = decodeProgram(base64);
    expect(new TextDecoder().decode(bytes)).toBe('hello solana');
  });
});
