import { Construction } from 'lucide-react';
import { useStore } from '../store/useStore';
import Btn from './Btn';

interface WIPModalProps {
  title: string;
  onClose: () => void;
}

export default function WIPModal({ title, onClose }: WIPModalProps) {
  const { theme } = useStore();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9000]"
      style={{
        background: 'rgba(0,0,0,0.72)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded flex flex-col overflow-hidden"
        style={{
          width: 400,
          background: 'var(--bg1)',
          border: '1px solid var(--bg5)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 pb-3.5"
          style={{ borderBottom: '1px solid var(--bg5)', flexShrink: 0 }}
        >
          <span className="text-base font-semibold" style={{ color: 'var(--tx)' }}>
            {title}
          </span>
          <button
            onClick={onClose}
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
            ×
          </button>
        </div>

        <div className="p-5 text-center pt-5 pb-2.5">
          <div
            className="w-14 h-14 rounded flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--bg5)',
            }}
          >
            <Construction size={26} style={{ color: 'var(--warning)' }} />
          </div>

          <div className="text-base font-semibold mb-2" style={{ color: 'var(--tx)' }}>
            Work in Progress
          </div>

          <div
            className="text-sm leading-6 mb-5"
            style={{ color: 'var(--tx2)' }}
          >
            <strong style={{ color: 'var(--ac)' }}>{title}</strong> is currently
            under development and will be available in a future release.
          </div>

          <div className="text-xs mb-5" style={{ color: 'var(--mt)' }}>
            Autonomous multi-step task execution is planned. Stay tuned for
            updates.
          </div>

          <Btn variant="accent" onClick={onClose} icon={undefined}>
            Got it
          </Btn>
        </div>
      </div>
    </div>
  );
}