import { Folder, GitBranch, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import FileTree from './FileTree';
import FileEditor from './FileEditor';
import GitPanel from './GitPanel';
import SkillsPanel from './SkillsPanel';

export default function RightPanel() {
  const {
    rightWidth,
    rightTab,
    setRightTab,
    openFile,
    setOpenFile,
    projectPath,
    projectSelected,
  } = useStore();

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width: rightWidth,
        background: 'var(--bg1)',
        borderLeft: '1px solid var(--bg5)',
      }}
    >
      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--bg5)' }}>
        {[
          { id: 'files' as const, icon: Folder, label: 'Files' },
          { id: 'git' as const, icon: GitBranch, label: 'Git' },
          { id: 'skills' as const, icon: Layers, label: 'Skills' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setRightTab(tab.id);
              if (tab.id !== 'files') {
                setOpenFile(null);
              }
            }}
            className="flex-1 h-[38px] flex items-center justify-center gap-1 text-sm cursor-pointer transition-all"
            style={{
              background: 'transparent',
              border: 'none',
              color: rightTab === tab.id ? 'var(--tx)' : 'var(--mt)',
              borderBottom: `2px solid ${rightTab === tab.id ? 'var(--ac)' : 'transparent'}`,
            }}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {rightTab === 'files' && openFile ? (
        <FileEditor file={openFile} onClose={() => setOpenFile(null)} />
      ) : (
        <>
          {rightTab === 'files' && (
            <FileTree />
          )}
          {rightTab === 'git' && (
            <GitPanel />
          )}
          {rightTab === 'skills' && (
            <SkillsPanel />
          )}
        </>
      )}
    </div>
  );
}