import type { AppTab } from '../../app/store';
import { useAppStore } from '../../app/store';

const TABS: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: 'editor', label: 'Explorer', icon: 'F' },
  { id: 'build', label: 'Build', icon: 'B' },
  { id: 'deploy', label: 'Deploy', icon: 'D' },
  { id: 'idl', label: 'IDL', icon: 'I' },
  { id: 'test', label: 'Test', icon: 'T' },
  { id: 'explorer', label: 'On-chain', icon: 'E' },
  { id: 'accounts', label: 'Accounts', icon: 'A' },
  { id: 'tx', label: 'Tx', icon: 'X' },
  { id: 'settings', label: 'Settings', icon: 'S' },
];

export function Sidebar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <div style={{ width: 48, background: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, flexShrink: 0 }}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          title={tab.label}
          onClick={() => setActiveTab(tab.id)}
          style={{
            width: 36, height: 36, margin: '2px 0',
            background: activeTab === tab.id ? '#094771' : 'transparent',
            border: 'none', borderRadius: 4, cursor: 'pointer',
            fontSize: 11, color: '#ccc', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
}
