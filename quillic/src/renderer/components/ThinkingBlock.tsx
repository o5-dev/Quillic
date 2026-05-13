import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';

interface ThinkingBlockProps {
  content: string;
  duration?: number;
  streaming?: boolean;
}

export default function ThinkingBlock({ content, duration, streaming }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded mb-2.5 overflow-hidden"
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--bg5)',
        borderLeft: '2px solid var(--ac)',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 cursor-pointer"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Brain size={13} style={{ color: 'var(--ac)' }} />
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--ac)' }}
        >
          {streaming ? 'Thinking…' : `Thought for ${duration}s`}
        </span>
        {!streaming && (
          <span
            className="text-xs ml-1"
            style={{ color: 'var(--mt)' }}
          >
            · {content?.split(' ').length || 0} tokens
          </span>
        )}
        {open ? (
          <ChevronUp size={12} className="ml-auto" style={{ color: 'var(--mt)' }} />
        ) : (
          <ChevronDown size={12} className="ml-auto" style={{ color: 'var(--mt)' }} />
        )}
      </div>

      {open && (
        <div
          className="mono px-3 pb-2.5 pt-2 text-xs"
          style={{
            color: 'var(--mt)',
            lineHeight: 1.7,
            borderTop: '1px solid var(--bg5)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}