import { Globe } from 'lucide-react';

interface WebSearchBlockProps {
  query: string;
  sources: Array<{ url: string }>;
}

export default function WebSearchBlock({ query, sources }: WebSearchBlockProps) {
  return (
    <div
      className="rounded px-3 py-2 mb-2.5"
      style={{
        background: 'rgba(96,165,250,0.07)',
        border: '1px solid rgba(96,165,250,0.2)',
      }}
    >
      <div
        className="flex items-center gap-1 text-sm font-medium mb-1.5"
        style={{ color: 'var(--info)' }}
      >
        <Globe size={13} />
        Web search — "{query}"
      </div>
      {sources.map((source, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 text-xs py-0.5"
          style={{ color: 'var(--mt)' }}
        >
          <span
            className="mono text-[10.5px]"
            style={{ color: 'var(--ac)' }}
          >
            [{i + 1}]
          </span>
          <span>{source.url}</span>
        </div>
      ))}
    </div>
  );
}