import { useState } from 'react';
import { GitBranch, Download, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import Btn from './Btn';

export default function GitPanel() {
  const { projectPath, projectSelected } = useStore();
  const [commitMsg, setCommitMsg] = useState('');

  // Mock data for now - in real app, this would come from git status
  const staged = ['app/auth/jwt.py', 'app/models/user.py', 'app/routes/auth.py'];
  const unstaged = ['app/config.py', 'docker-compose.yml'];
  const untracked = ['tests/test_auth.py', 'README.md'];

  if (!projectSelected || !projectPath) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          className="p-5 text-center text-sm"
          style={{ color: 'var(--mt)' }}
        >
          No git repository found in this project folder.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-2">
        {/* Branch info */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--tx2)' }}>
            <GitBranch size={13} style={{ color: 'var(--ac)' }} />
            <span className="mono" style={{ color: 'var(--ac)' }}>
              main
            </span>
          </div>
          <div className="flex gap-1">
            <Btn small variant="outline" icon={Download}>
              Pull
            </Btn>
            <Btn small variant="outline" icon={Upload}>
              Push
            </Btn>
          </div>
        </div>

        {/* Staged */}
        {staged.length > 0 && (
          <>
            <div
              className="text-[10.5px] mb-1"
              style={{
                color: 'var(--mt)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Staged ({staged.length})
            </div>
            {staged.map((file) => (
              <div
                key={file}
                className="mono flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs"
                style={{ color: 'var(--success)' }}
              >
                <span className="text-[10px]">M</span>
                {file}
              </div>
            ))}
          </>
        )}

        {/* Modified */}
        {unstaged.length > 0 && (
          <>
            <div
              className="text-[10.5px] mt-2 mb-1"
              style={{
                color: 'var(--mt)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Modified ({unstaged.length})
            </div>
            {unstaged.map((file) => (
              <div
                key={file}
                className="mono flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs"
                style={{ color: 'var(--warning)' }}
              >
                <span className="text-[10px]">M</span>
                {file}
              </div>
            ))}
          </>
        )}

        {/* Untracked */}
        {untracked.length > 0 && (
          <>
            <div
              className="text-[10.5px] mt-2 mb-1"
              style={{
                color: 'var(--mt)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Untracked ({untracked.length})
            </div>
            {untracked.map((file) => (
              <div
                key={file}
                className="mono flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs"
                style={{ color: 'var(--mt)' }}
              >
                <span className="text-[10px]">?</span>
                {file}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Commit area */}
      <div
        className="p-2.5"
        style={{ borderTop: '1px solid var(--bg5)', flexShrink: 0 }}
      >
        <textarea
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="Commit message…"
          className="w-full rounded px-2.5 py-2 text-sm outline-none resize-none"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--bg5)',
            color: 'var(--tx)',
            height: 48,
            lineHeight: 1.5,
          }}
        />
        <div className="flex gap-1.5 mt-1.5">
          <Btn small variant="outline">Stage All</Btn>
          <Btn small variant="accent">Commit</Btn>
        </div>
      </div>
    </div>
  );
}