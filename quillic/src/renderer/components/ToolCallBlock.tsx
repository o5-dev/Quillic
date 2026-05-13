import { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { ToolCall } from '@shared/types';

interface ToolCallBlockProps {
  toolCall: ToolCall;
}

export default function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [open, setOpen] = useState(false);

  const statusConfig = {
    running: { bg: 'var(--ac-dim)', color: 'var(--ac)' },
    done: { bg: 'rgba(74,222,128,0.1)', color: 'var(--success)' },
    failed: { bg: 'rgba(248,113,113,0.1)', color: 'var(--error)' },
  };

  const config = statusConfig[toolCall.status] || statusConfig.done;

  return (
    <div
      className="rounded mb-1 overflow-hidden"
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--bg5)',
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Wrench size={13} style={{ color: 'var(--mt)' }} />
        <span
          className="mono text-xs font-medium"
          style={{ color: 'var(--ac)' }}
        >
          {toolCall.name}
        </span>
        <span
          className="mono text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: 'var(--mt)' }}
        >
          {typeof toolCall.args === 'string'
            ? toolCall.args
            : JSON.stringify(toolCall.args)?.slice(0, 50)}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded flex-shrink-0"
          style={{
            background: config.bg,
            color: config.color,
            animation: toolCall.status === 'running' ? 'pulse 1.4s ease-in-out infinite' : 'none',
          }}
        >
          {toolCall.status === 'running'
            ? 'Running…'
            : toolCall.status === 'done'
            ? `Done · ${toolCall.duration}ms`
            : 'Failed'}
        </span>
        {open ? (
          <ChevronUp size={11} style={{ color: 'var(--mt)' }} />
        ) : (
          <ChevronDown size={11} style={{ color: 'var(--mt)' }} />
        )}
      </div>

      {open && (
        <div
          className="px-3 py-2.5"
          style={{ borderTop: '1px solid var(--bg5)' }}
        >
          <div className="text-xs mb-1" style={{ color: 'var(--mt)' }}>
            Input
          </div>
          <pre
            className="mono text-xs p-2 rounded overflow-auto"
            style={{
              color: 'var(--tx2)',
              background: 'var(--bg3)',
            }}
          >
            {typeof toolCall.args === 'string'
              ? toolCall.args
              : JSON.stringify(toolCall.args, null, 2)}
          </pre>

          {toolCall.result && (
            <>
              <div className="text-xs mt-2 mb-1" style={{ color: 'var(--mt)' }}>
                Output
              </div>
              <pre
                className="mono text-xs p-2 rounded overflow-auto"
                style={{
                  color: 'var(--tx2)',
                  background: 'var(--bg3)',
                }}
              >
                {typeof toolCall.result === 'string'
                  ? toolCall.result
                  : JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}