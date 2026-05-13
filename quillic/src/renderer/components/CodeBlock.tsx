import { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeBlockProps {
  lang: string;
  code: string;
  filename?: string;
}

const LANG_COLORS: Record<string, string> = {
  python: '#86efac',
  py: '#86efac',
  javascript: '#fbbf24',
  js: '#fbbf24',
  typescript: '#60A5FA',
  ts: '#60A5FA',
  tsx: '#60A5FA',
  jsx: '#fbbf24',
  rust: '#fca5a5',
  rs: '#fca5a5',
  go: '#67e8f9',
  html: '#f97316',
  css: '#c084fc',
  scss: '#c084fc',
  bash: '#4ADE80',
  sh: '#4ADE80',
  json: '#fbbf24',
  sql: '#60A5FA',
  yaml: '#86EFAC',
  yml: '#86EFAC',
  dockerfile: '#60A5FA',
  markdown: '#B8B8B5',
  md: '#B8B8B5',
};

const getLangColor = (lang?: string) => LANG_COLORS[lang?.toLowerCase() || ''] || '#787771';

const getExt = (lang?: string) => {
  const map: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    tsx: 'tsx',
    jsx: 'jsx',
    rust: 'rs',
    go: 'go',
    html: 'html',
    css: 'css',
    bash: 'sh',
    json: 'json',
    sql: 'sql',
    yaml: 'yaml',
    dockerfile: 'dockerfile',
    markdown: 'md',
  };
  return map[lang?.toLowerCase() || ''] || lang || 'txt';
};

export default function CodeBlock({ lang, code, filename }: CodeBlockProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const color = getLangColor(lang);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = getExt(lang);
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || `file.${ext}`;
    a.click();
  };

  return (
    <div
      className="rounded overflow-hidden my-2"
      style={{
        background: 'var(--bg0)',
        border: '1px solid var(--bg5)',
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-all"
        style={{
          background: 'var(--bg2)',
          borderBottom: open ? '1px solid var(--bg5)' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg2)';
        }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span
          className="mono text-xs font-medium"
          style={{ color, fontSize: 11.5 }}
        >
          {lang || 'code'}
        </span>
        {filename && (
          <span className="text-xs" style={{ color: 'var(--tx2)' }}>
            — {filename}
          </span>
        )}
        {!open && (
          <span className="text-xs" style={{ color: 'var(--mt)', marginLeft: 4 }}>
            click to expand
          </span>
        )}
        <div className="flex-1" />
        <div
          className="flex gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-all"
            style={{
              background: 'none',
              border: 'none',
              color: copied ? 'var(--success)' : 'var(--mt)',
              cursor: 'pointer',
            }}
          >
            {copied ? <Copy size={12} /> : <Copy size={12} />}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-all"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--mt)',
              cursor: 'pointer',
            }}
          >
            <Download size={12} />
          </button>
        </div>
        {open ? (
          <ChevronUp size={12} style={{ color: 'var(--mt)' }} />
        ) : (
          <ChevronDown size={12} style={{ color: 'var(--mt)' }} />
        )}
      </div>

      {open && (
        <div className="overflow-x-auto px-4 py-3.5">
          <pre
            className="mono"
            style={{
              fontSize: 12,
              lineHeight: 1.75,
              color: '#c4c4c0',
              margin: 0,
            }}
          >
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}