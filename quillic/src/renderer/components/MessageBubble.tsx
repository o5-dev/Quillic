import { useState } from 'react';
import { Copy, RefreshCw, Cpu } from 'lucide-react';
import { Message, AttachedFile } from '@shared/types';
import CodeBlock from './CodeBlock';
import ThinkingBlock from './ThinkingBlock';
import ToolCallBlock from './ToolCallBlock';
import WebSearchBlock from './WebSearchBlock';
import FileChip from './FileChip';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onOpenFile?: (file: AttachedFile) => void;
}

export default function MessageBubble({ message, onRegenerate, onOpenFile }: MessageBubbleProps) {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(message.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div
        className="fade-in flex flex-col items-end gap-1.5 mb-1"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {message.attached_files && message.attached_files.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end">
            {message.attached_files.map((file, i) => (
              <FileChip
                key={i}
                file={file}
                onClick={() => onOpenFile?.(file)}
              />
            ))}
          </div>
        )}

        <div
          className="max-w-[68%] rounded-[14px_14px_4px_14px] px-4 py-2.5 text-[14px] leading-[1.65]"
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--bg5)',
            color: 'var(--tx)',
          }}
        >
          {message.content}
        </div>

        {hover && (
          <div className="flex gap-0.5">
            <button
              onClick={handleCopy}
              className="w-6 h-6 rounded flex items-center justify-center transition-all"
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? 'var(--success)' : 'var(--mt)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg3)';
                e.currentTarget.style.color = 'var(--tx)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = copied ? 'var(--success)' : 'var(--mt)';
              }}
            >
              {copied ? <Copy size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fade-in flex gap-3 items-start mb-1"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="w-[30px] h-[30px] rounded flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: 'var(--ac-dim)',
          border: '1px solid var(--ac-border)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--ac)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Q
      </div>

      <div className="flex-1 min-w-0">
        {message.thinking_content && <ThinkingBlock content={message.thinking_content} />}

        {message.tool_calls && message.tool_calls.length > 0 && (
          <>
            {message.tool_calls.map((tc, i) => (
              <ToolCallBlock key={i} toolCall={tc} />
            ))}
          </>
        )}

        <div
          className="text-[14px] leading-[1.75]"
          style={{ color: 'var(--tx)' }}
        >
          <MessageContent content={message.content} />
        </div>

        {message.tokens_used && (
          <div
            className="text-xs mt-1.5 flex items-center gap-1"
            style={{ color: 'var(--mt)' }}
          >
            <Cpu size={11} />
            {message.tokens_used.toLocaleString()} tokens
          </div>
        )}

        {hover && (
          <div className="flex gap-0.5 mt-1">
            <button
              onClick={handleCopy}
              className="w-6 h-6 rounded flex items-center justify-center transition-all"
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? 'var(--success)' : 'var(--mt)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg3)';
                e.currentTarget.style.color = 'var(--tx)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = copied ? 'var(--success)' : 'var(--mt)';
              }}
            >
              {copied ? <Copy size={12} /> : <Copy size={12} />}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
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
                <RefreshCw size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const firstLine = part.slice(3).split('\n')[0].trim();
          const [langPart, ...fileNameParts] = firstLine.split(':');
          const lang = langPart.trim();
          const filename = fileNameParts.join(':').trim() || null;
          const code = part.slice(3).split('\n').slice(1).join('\n').replace(/```$/, '').trimEnd();

          return <CodeBlock key={i} lang={lang} code={code} filename={filename} />;
        }

        // Simple markdown rendering
        const html = part
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code style="background:var(--bg3);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:12px">$1</code>')
          .replace(/\n\n/g, '</p><p style="margin-bottom:8px">')
          .replace(/\n/g, '<br/>');

        return <p key={i} style={{ marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </>
  );
}