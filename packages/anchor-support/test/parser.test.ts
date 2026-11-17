import { describe, it, expect } from 'vitest';
import { parseIdl, typeLabel } from '../src/index.js';

describe('anchor-support parser', () => {
  it('parses valid minimal IDL', () => {
    const raw = {
      version: '0.1.0',
      name: 'counter',
      instructions: [
        {
          name: 'initialize',
          accounts: [],
          args: [{ name: 'start', type: 'u64' }],
        },
      ],
    };
    const idl = parseIdl(raw);
    expect(idl.name).toBe('counter');
    expect(idl.instructions).toHaveLength(1);
  });

  it('formats type labels correctly', () => {
    expect(typeLabel('u64')).toBe('u64');
    expect(typeLabel({ vec: 'u8' })).toBe('Vec<u8>');
    expect(typeLabel({ option: 'string' })).toBe('Option<string>');
  });

  it('throws on non-object IDL', () => {
    expect(() => parseIdl(null)).toThrow();
    expect(() => parseIdl('not an object')).toThrow();
  });
});
