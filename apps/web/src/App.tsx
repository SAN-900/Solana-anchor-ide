import { useEffect } from 'react';
import { Providers } from './app/providers';
import { useAppStore } from './app/store';
import { useEditorStore } from './features/editor/use-editor-store';
import { COUNTER_FIXTURE } from './app/fixtures';

import { Sidebar } from './components/Layout/Sidebar';
import { StatusBar } from './components/Layout/StatusBar';
import { EditorTabs } from './features/editor/Tabs';
import { IdeEditor } from './features/editor/Editor';
import { FileTree } from './features/editor/FileTree';

import { BuildPanel } from './features/build/BuildPanel';
import { DeployPanel } from './features/deploy/DeployPanel';
import { ExplorerPanel } from './features/explorer/ExplorerPanel';
import { IdlPanel } from './features/idl/IdlPanel';
import { TestPanel } from './features/test/TestPanel';
import { AccountsPanel } from './features/accounts/AccountsPanel';
import { TxBuilder } from './features/tx/TxBuilder';
import { SettingsPanel } from './features/settings/SettingsPanel';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useBuild } from './features/build/use-build';
import { useBuildStore } from './features/build/build-store';
import { useDeploy } from './features/deploy/use-deploy';
import { useDeployStore } from './features/deploy/deploy-store';
import { useWallet } from '@solana/wallet-adapter-react';

function IdeLayout() {
  const activeTab = useAppStore((s) => s.activeTab);
  const cluster = useAppStore((s) => s.cluster);

  const files = useEditorStore((s) => s.files);
  const addFile = useEditorStore((s) => s.addFile);
  const openFile = useEditorStore((s) => s.openFile);

  const { compile } = useBuild();
  const buildStatus = useBuildStore((s) => s.status);
  const buildResult = useBuildStore((s) => s.result);

  const { deploy } = useDeploy();
  const deployStatus = useDeployStore((s) => s.status);
  const wallet = useWallet();

  // Populate starter counter program on first load
  useEffect(() => {
    if (Object.keys(files).length === 0) {
      for (const [path, content] of Object.entries(COUNTER_FIXTURE.files)) {
        const ext = path.split('.').pop();
        const language = ext === 'rs' ? 'rust' : ext === 'toml' ? 'toml' : ext === 'ts' ? 'typescript' : 'plaintext';
        addFile({ path, content, language });
      }
      openFile('programs/counter/src/lib.rs');
    }
  }, [files, addFile, openFile]);

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'editor':
        return <FileTree />;
      case 'build':
        return <BuildPanel />;
      case 'deploy':
        return <DeployPanel />;
      case 'explorer':
        return <ExplorerPanel />;
      case 'idl':
        return <IdlPanel />;
      case 'test':
        return <TestPanel />;
      case 'accounts':
        return <AccountsPanel />;
      case 'tx':
        return <TxBuilder />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <FileTree />;
    }
  };

  return (
    <div style={styles.root}>
      {/* Top Application Header */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <strong style={{ fontSize: 14, letterSpacing: -0.2 }}>Solana Web IDE</strong>
          <span style={styles.clusterBadge}>{cluster}</span>
        </div>

        <div style={styles.spacer} />

        <div style={styles.actionGroup}>
          <button
            style={{
              ...styles.headerBtn,
              background: buildStatus === 'compiling' ? '#665c1e' : '#0e639c',
            }}
            disabled={buildStatus === 'compiling'}
            onClick={compile}
          >
            {buildStatus === 'compiling' ? 'Compiling...' : 'Compile'}
          </button>

          <button
            style={{
              ...styles.headerBtn,
              background: !buildResult?.ok || !wallet.publicKey ? '#2c473a' : '#16825d',
              opacity: !buildResult?.ok || !wallet.publicKey ? 0.6 : 1,
              cursor: !buildResult?.ok || !wallet.publicKey ? 'not-allowed' : 'pointer',
            }}
            disabled={!buildResult?.ok || !wallet.publicKey || deployStatus === 'deploying'}
            onClick={deploy}
          >
            {deployStatus === 'deploying' ? 'Deploying...' : 'Deploy'}
          </button>

          <WalletMultiButton style={styles.walletBtn} />
        </div>
      </header>

      {/* Main Workspace Body */}
      <div style={styles.body}>
        {/* Activity Bar */}
        <Sidebar />

        {/* Feature Tool Panel */}
        <aside style={styles.sidePanel}>
          {renderActivePanel()}
        </aside>

        {/* Editor Area */}
        <main style={styles.editorArea}>
          <EditorTabs />
          <div style={styles.editorContainer}>
            <IdeEditor />
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export function App() {
  return (
    <Providers>
      <IdeLayout />
    </Providers>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: '#1e1e1e',
    color: '#ddd',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: '#252526',
    borderBottom: '1px solid #333',
    height: 44,
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  clusterBadge: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    padding: '2px 8px',
    borderRadius: 10,
    background: '#094771',
    color: '#4ea1ff',
    border: '1px solid #1769aa',
  },
  spacer: {
    flex: 1,
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerBtn: {
    border: 'none',
    color: '#fff',
    padding: '5px 14px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },
  walletBtn: {
    height: 30,
    lineHeight: '30px',
    padding: '0 12px',
    fontSize: 12,
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sidePanel: {
    width: 270,
    minWidth: 200,
    maxWidth: 400,
    background: '#252526',
    borderRight: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  editorArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: '#1e1e1e',
    overflow: 'hidden',
  },
  editorContainer: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
};
