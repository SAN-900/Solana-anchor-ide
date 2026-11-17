import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { Web3RpcClient } from '@solana-web-ide/rpc';
import { useAppStore } from '../app/store';

/** Returns a typed RPC client bound to the current cluster + provider settings. */
export function useRpc() {
  const { connection } = useConnection();
  const cluster = useAppStore((s) => s.cluster);

  const client = useMemo(() => {
    // TODO: pick provider from settings store (Helius / Triton / public)
    const provider = { kind: 'public' as const, label: `Public (${cluster})`, url: connection.rpcEndpoint, requiresApiKey: false };
    return new Web3RpcClient(cluster, provider);
  }, [cluster, connection.rpcEndpoint]);

  return client;
}
