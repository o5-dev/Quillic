import { FileCode } from 'lucide-react';
import { AttachedFile } from '@shared/types';

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
};

const getLangColor = (ext?: string) => LANG_COLORS[ext?.toLowerCase() || ''] || '#787771';

interface FileChipProps {
  file: AttachedFile;
  onClick?: () => void;
  onRemove?: () => void;
}

export default function FileChip({ file, onClick, onRemove }: FileChipProps) {
  const ext = file.name?.split('.').pop() || '';
  const color = getLangColor(ext);

  return (
    <div
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 max-w-[180px] transition-all"
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--bg5)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--ac)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--bg5)';
      }}
    >
      <FileCode size={12} style={{ color }} />
      <span
        className="mono text-[10px] px-1 py-0.5 rounded font-semibold"
        style={{
          background: `${color}22`,
          color,
        }}
      >
        {ext.toUpperCase()}
      </span>
      <span
        className="text-xs overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: 'var(--tx2)' }}
      >
        {file.name}
      </span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="cursor-pointer leading-none text-sm"
          style={{ color: 'var(--mt)', marginLeft: 2 }}
        >
          ×
        </span>
      )}
    </div>
  );
}