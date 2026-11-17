import { describe, it, expect } from 'vitest';
import { isWasmReady } from '../src/index.js';

describe('compiler-wasm loader', () => {
  it('reports wasm not ready initially', () => {
    expect(isWasmReady()).toBe(false);
  });
});
