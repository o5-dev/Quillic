import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { useStore } from '../store/useStore';

const LANG_COLORS: Record<string, string> = {
  py: '#86efac',
  js: '#fbbf24',
  ts: '#60A5FA',
  tsx: '#60A5FA',
  jsx: '#fbbf24',
  rs: '#fca5a5',
  go: '#67e8f9',
  html: '#f97316',
  css: '#c084fc',
  scss: '#c084fc',
  json: '#fbbf24',
  md: '#B8B8B5',
  sh: '#4ADE80',
  sql: '#60A5FA',
  yaml: '#86EFAC',
  yml: '#86EFAC',
  dockerfile: '#60A5FA',
};

const getLangColor = (ext?: string) => LANG_COLORS[ext?.toLowerCase() || ''] || '#787771';

interface FileEditorProps {
  file: { name: string; path: string; content: string };
  onClose: () => void;
}

export default function FileEditor({ file, onClose }: FileEditorProps) {
  const [content, setContent] = useState(file.content || '');
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const lang = file.name?.split('.').pop() || 'text';

  useEffect(() => {
    setContent(file.content || '');
  }, [file.content]);

  const handleChange = (value: string) => {
    setContent(value);
    setSaveState('unsaved');

    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      setSaveState('saving');
      setTimeout(() => setSaveState('saved'), 600);
    }, 1200);
  };

  const handleSave = async () => {
    try {
      await window.electronAPI.writeFile(file.path, content);
      setSaveState('saved');
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const lines = content.split('\n');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          borderBottom: '1px solid var(--bg5)',
          flexShrink: 0,
          background: 'var(--bg2)',
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-1 py-0.5 rounded text-xs transition-all"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mt)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--tx)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--mt)';
          }}
        >
          <ArrowLeft size={13} />
          <span>Files</span>
        </button>

        <div
          className="w-px h-3.5"
          style={{ background: 'var(--bg5)' }}
        />

        <div
          className="w-2 h-2 rounded-full"
          style={{ background: getLangColor(lang) }}
        />

        <span
          className="mono text-xs flex-1"
          style={{ color: 'var(--tx2)' }}
        >
          {file.name}
        </span>

        <span
          className="text-xs flex items-center gap-1"
          style={{
            color:
              saveState === 'saved'
                ? 'var(--success)'
                : saveState === 'saving'
                ? 'var(--warning)'
                : 'var(--mt)',
          }}
        >
          {saveState === 'saved' && (
            <>
              <Check size={11} style={{ color: 'var(--success)' }} />
              Saved
            </>
          )}
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'unsaved' && 'Unsaved*'}
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Line numbers */}
        <div
          className="mono flex-shrink-0 overflow-hidden py-3 pr-2 text-right"
          style={{
            width: 40,
            background: 'var(--bg2)',
            borderRight: '1px solid var(--bg5)',
            fontSize: 11,
            lineHeight: 1.7,
            color: 'var(--mt)',
          }}
        >
          {lines.map((_, i) => (
            <div key={i} style={{ paddingRight: 8 }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code area */}
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent border-none outline-none resize-none py-3 px-4 overflow-y-auto"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--tx)',
            lineHeight: 1.7,
            userSelect: 'text',
          }}
        />
      </div>

      {/* Footer */}
      <div
        className="px-3 py-1.5 flex gap-3 text-xs"
        style={{
          borderTop: '1px solid var(--bg5)',
          background: 'var(--bg2)',
          flexShrink: 0,
          color: 'var(--mt)',
        }}
      >
        <span className="mono" style={{ color: getLangColor(lang) }}>
          {lang.toUpperCase()}
        </span>
        <span>{lines.length} lines</span>
        <span>{content.length} chars</span>
      </div>
    </div>
  );
}