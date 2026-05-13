import { FolderOpen } from 'lucide-react';

interface ProjectPickerProps {
  onSelect: (path: string | null) => void;
}

export default function ProjectPicker({ onSelect }: ProjectPickerProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4.5 p-10">
      <div
        className="flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'var(--ac-dim)',
          border: '1px solid var(--ac-border)',
        }}
      >
        <FolderOpen size={28} style={{ color: 'var(--ac)' }} />
      </div>

      <div className="text-center">
        <div
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--tx)' }}
        >
          Select a project folder to start
        </div>
        <div
          className="text-sm leading-6"
          style={{ color: 'var(--mt)' }}
        >
          Choose a folder to give Quillic access to your files.
          <br />
          The AI will be able to read, write, and navigate your project.
        </div>
      </div>

      <button
        onClick={() => onSelect(null)}
        className="px-4 py-2 rounded text-sm font-medium cursor-pointer transition-all"
        style={{
          background: 'var(--ac)',
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        <FolderOpen size={14} />
        Browse for folder…
      </button>

      <button
        onClick={() => onSelect(null)}
        className="text-xs cursor-pointer transition-all"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--mt)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--tx)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--mt)';
        }}
      >
        Skip for now
      </button>
    </div>
  );
}