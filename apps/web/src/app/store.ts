import { create } from 'zustand';
import type { Cluster } from '@solana-web-ide/shared';

export type AppTab = 'editor' | 'build' | 'deploy' | 'explorer' | 'idl' | 'test' | 'accounts' | 'tx' | 'settings';

interface AppState {
  activeTab: AppTab;
  cluster: Cluster;
  setActiveTab: (tab: AppTab) => void;
  setCluster: (cluster: Cluster) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'editor',
  cluster: 'devnet',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCluster: (cluster) => set({ cluster }),
}));
