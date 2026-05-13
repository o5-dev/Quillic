import { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { useStore } from '../store/useStore';

interface IconBtnProps {
  icon: LucideIcon;
  title?: string;
  onClick?: () => void;
  active?: boolean;
  size?: number;
  tooltipPos?: 'top' | 'bottom' | 'right';
}

export default function IconBtn({
  icon: Icon,
  title,
  onClick,
  active = false,
  size = 15,
  tooltipPos = 'top',
}: IconBtnProps) {
  const { theme } = useStore();

  const [showTooltip, setShowTooltip] = useState(false);

  const positions = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 7px)', left: '50%', transform: 'translateX(-50%)' },
    right: { left: 'calc(100% + 7px)', top: '50%', transform: 'translateY(-50%)' },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        className="w-[30px] h-[30px] rounded flex items-center justify-center transition-all flex-shrink-0"
        style={{
          background: active ? 'var(--ac-dim)' : 'transparent',
          color: active ? 'var(--ac)' : 'var(--mt)',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'var(--bg3)';
            e.currentTarget.style.color = 'var(--tx)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--mt)';
          }
        }}
      >
        <Icon size={size} />
      </button>

      {showTooltip && title && (
        <div
          className="absolute px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-[99999]"
          style={{
            ...positions[tooltipPos],
            background: '#111',
            color: '#f2f2f0',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
}