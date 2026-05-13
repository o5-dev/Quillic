import { useState } from 'react';
import { Terminal, Trash } from 'lucide-react';

interface TerminalPanelProps {
  height: number;
}

export default function TerminalPanel({ height }: TerminalPanelProps) {
  const [tabs] = useState([{ id: 1, name: 'bash' }]);
  const [active] = useState(1);

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        borderTop: '1px solid var(--bg5)',
        background: 'var(--bg0)',
        height,
      }}
    >
      {/* Tabs */}
      <div
        className="flex items-center gap-1.5 px-2.5"
        style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--bg5)',
          height: 30,
          flexShrink: 0,
        }}
      >
        <Terminal size={13} style={{ color: 'var(--mt)' }} />

        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="px-2.5 py-0.5 rounded text-xs flex items-center gap-1 mono"
            style={{
              background:
                active === tab.id
                  ? 'rgba(74,222,128,0.08)'
                  : 'var(--bg3)',
              color: active === tab.id ? 'var(--success)' : 'var(--mt)',
              border:
                active === tab.id
                  ? '1px solid rgba(74,222,128,0.2)'
                  : '1px solid transparent',
            }}
          >
            {tab.name}
            {active === tab.id && (
              <span
                className="w-1 h-1 rounded-full"
                style={{
                  background: 'var(--success)',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              />
            )}
          </div>
        ))}

        <div className="flex-1" />

        <span className="mono text-[10px]" style={{ color: 'var(--mt)' }}>
          ~/auth-api
        </span>

        <button
          className="w-6 h-6 rounded flex items-center justify-center transition-all"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--mt)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg3)';
            e.currentTarget.style.color = 'var(--tx)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--mt)';
          }}
        >
          <Trash size={13} />
        </button>
      </div>

      {/* Terminal content */}
      <div
        className="flex-1 overflow-y-auto p-3.5 mono"
        style={{
          fontSize: 12,
          lineHeight: 1.7,
        }}
      >
        <div style={{ color: 'var(--ac)' }}>~/auth-api $ </div>
        <div style={{ color: 'var(--tx)' }}>
          <span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--tx)', marginLeft: 2, animation: 'blink 1s step-end infinite' }} />
        </div>
      </div>
    </div>
  );
}