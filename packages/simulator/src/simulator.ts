import type { Connection } from '@solana/web3.js';
import type { SimulateTarget, SimulateResult } from './types.js';

/**
 * Simulate a transaction and return structured logs + compute units.
 * Uses simulateTransaction RPC call — no lamports are spent.
 */
export async function simulateTx(
  connection: Connection,
  tx: SimulateTarget,
): Promise<SimulateResult> {
  try {
    const res = await (connection as unknown as {
      simulateTransaction: (tx: SimulateTarget) => Promise<{ value: { logs: string[] | null; err: unknown; unitsConsumed?: number } }>;
    }).simulateTransaction(tx);
    const { logs, err, unitsConsumed } = res.value;
    return {
      ok: err === null,
      logs: logs ?? [],
      unitsConsumed,
      error: err ? JSON.stringify(err) : undefined,
    };
  } catch (err) {
    return { ok: false, logs: [], error: String(err) };
  }
}
