import { useState, useEffect } from 'react';

const SLASH_CMDS = [
  { cmd: '/think', desc: 'Enable chain-of-thought reasoning' },
  { cmd: '/search', desc: 'Force web search before answering' },
  { cmd: '/scrape', desc: 'Fetch and summarise a URL' },
  { cmd: '/file', desc: 'Open a project file for analysis' },
  { cmd: '/run', desc: 'Run a shell command' },
  { cmd: '/write', desc: 'Write or overwrite a file' },
  { cmd: '/edit', desc: 'Open file in IDE' },
  { cmd: '/diff', desc: 'Show diff between two files' },
  { cmd: '/api', desc: 'Query a public API' },
  { cmd: '/image', desc: 'Analyse an image URL' },
  { cmd: '/chart', desc: 'Generate a chart or graph' },
  { cmd: '/table', desc: 'Format data as a table' },
  { cmd: '/clear', desc: 'Clear chat display' },
  { cmd: '/new', desc: 'Start a new chat' },
  { cmd: '/model', desc: 'Switch model' },
  { cmd: '/skill', desc: 'Use or list available skills' },
  { cmd: '/vault', desc: 'Search Obsidian vault' },
  { cmd: '/help', desc: 'Show all commands' },
];

interface SlashPickerProps {
  query: string;
  onSelect: (cmd: string) => void;
}

export default function SlashPicker({ query, onSelect }: SlashPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = SLASH_CMDS.filter((c) =>
    c.cmd.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <div
      className="slide-up rounded p-1 mb-1.5"
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--bg5)',
        boxShadow: '0 -10px 28px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="px-2.5 py-1 text-[10px]"
        style={{
          color: 'var(--mt)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        Commands
      </div>

      {filtered.map((cmd, i) => (
        <div
          key={cmd.cmd}
          onClick={() => onSelect(cmd.cmd)}
          onMouseEnter={() => setSelectedIndex(i)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded cursor-pointer transition-all"
          style={{
            background: i === selectedIndex ? 'var(--bg4)' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (i !== selectedIndex) {
              e.currentTarget.style.background = 'var(--bg3)';
            }
          }}
          onMouseLeave={(e) => {
            if (i !== selectedIndex) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <span
            className="mono text-xs"
            style={{
              color: 'var(--ac)',
              width: 100,
              flexShrink: 0,
            }}
          >
            {cmd.cmd}
          </span>
          <span className="text-sm" style={{ color: 'var(--tx2)' }}>
            {cmd.desc}
          </span>
        </div>
      ))}
    </div>
  );
}