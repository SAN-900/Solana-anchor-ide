import { create } from 'zustand';
import type { DeployProgress } from '@solana-web-ide/deploy';

export type DeployStatus = 'idle' | 'deploying' | 'success' | 'error';

interface DeployState {
  status: DeployStatus;
  programId: string | null;
  signature: string | null;
  progress: DeployProgress | null;
  error: string | null;
  startDeploy: () => void;
  setProgress: (p: DeployProgress) => void;
  setSuccess: (programId: string, signature?: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useDeployStore = create<DeployState>((set) => ({
  status: 'idle',
  programId: null,
  signature: null,
  progress: null,
  error: null,
  startDeploy: () => set({ status: 'deploying', progress: null, error: null, signature: null }),
  setProgress: (progress) => set({ progress }),
  setSuccess: (programId, signature) => set({ status: 'success', programId, signature }),
  setError: (error) => set({ status: 'error', error }),
  reset: () => set({ status: 'idle', programId: null, signature: null, progress: null, error: null }),
}));
