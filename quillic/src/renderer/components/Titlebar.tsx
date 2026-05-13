import { Minus, Square, X } from 'lucide-react';

export default function Titlebar() {
  const handleMinimize = () => {
    window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI.maximize();
  };

  const handleClose = () => {
    window.electronAPI.close();
  };

  return (
    <div
      className="h-[42px] flex items-center px-4 gap-3 flex-shrink-0"
      style={{
        background: 'var(--bg1)',
        borderBottom: '1px solid var(--bg5)',
        WebkitAppRegion: 'drag',
      }}
    >
      <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            background: 'var(--ac)',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Q
        </div>
        <span>Quillic.ai</span>
      </div>

      <div className="flex-1" />

      <div className="flex gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={handleMinimize}
          className="w-7 h-7 rounded flex items-center justify-center transition-all"
          style={{
            background: 'transparent',
            color: 'var(--mt)',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'var(--tx)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--mt)';
          }}
        >
          <Minus size={13} />
        </button>

        <button
          onClick={handleMaximize}
          className="w-7 h-7 rounded flex items-center justify-center transition-all"
          style={{
            background: 'transparent',
            color: 'var(--mt)',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'var(--tx)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--mt)';
          }}
        >
          <Square size={13} />
        </button>

        <button
          onClick={handleClose}
          className="w-7 h-7 rounded flex items-center justify-center transition-all"
          style={{
            background: 'transparent',
            color: 'var(--mt)',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.18)';
            e.currentTarget.style.color = 'var(--error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--mt)';
          }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}