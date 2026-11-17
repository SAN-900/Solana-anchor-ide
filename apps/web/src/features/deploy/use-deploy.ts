import { useCallback } from 'react';
import { useDeployStore } from './deploy-store';
import { useBuildStore } from '../build/build-store';
import { useAppStore } from '../../app/store';
import { getOrCreateKeypair } from '@solana-web-ide/dev-keys';
import { deployProgram } from '@solana-web-ide/deploy';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export function useDeploy() {
  const { startDeploy, setProgress, setSuccess, setError } = useDeployStore();
  const buildResult = useBuildStore((s) => s.result);
  const cluster = useAppStore((s) => s.cluster);
  const { connection } = useConnection();
  const wallet = useWallet();

  const deploy = useCallback(async () => {
    if (!buildResult?.ok || !buildResult.programSoBase64) {
      setError('No compiled program available. Build first.');
      return;
    }
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Connect a wallet first.');
      return;
    }

    startDeploy();

    try {
      const programKeypair = getOrCreateKeypair('counter'); // TODO: derive from project name
      const result = await deployProgram(
        {
          programSoBase64: buildResult.programSoBase64,
          programKeypair,
          payerPublicKey: wallet.publicKey,
          cluster,
        },
        connection,
        wallet.signTransaction.bind(wallet),
        setProgress,
      );

      if (result.ok) {
        setSuccess(result.programId, result.signature);
      } else {
        setError(result.error ?? 'Deploy failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [buildResult, wallet, cluster, connection, startDeploy, setProgress, setSuccess, setError]);

  return { deploy };
}
