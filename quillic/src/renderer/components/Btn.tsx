import { LucideIcon } from 'lucide-react';
import { useStore } from '../store/useStore';

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'ghost' | 'accent' | 'danger' | 'outline';
  small?: boolean;
  icon?: LucideIcon;
  disabled?: boolean;
}

export default function Btn({
  children,
  onClick,
  variant = 'ghost',
  small = false,
  icon: Icon,
  disabled = false,
}: BtnProps) {
  const { theme } = useStore();

  const styles = {
    ghost: {
      background: 'var(--bg3)',
      color: 'var(--tx2)',
      border: 'none',
    },
    accent: {
      background: 'var(--ac)',
      color: '#fff',
      border: 'none',
    },
    danger: {
      background: 'rgba(248,113,113,0.1)',
      color: 'var(--error)',
      border: '1px solid rgba(248,113,113,0.25)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--tx2)',
      border: '1px solid var(--bg5)',
    },
  };

  const style = styles[variant];

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded transition-all"
      style={{
        padding: small ? '4px 11px' : '6px 15px',
        fontSize: small ? 12 : 13,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'ghost') {
            e.currentTarget.style.background = 'var(--bg4)';
            e.currentTarget.style.color = 'var(--tx)';
          }
          if (variant === 'outline') {
            e.currentTarget.style.borderColor = 'var(--ac)';
            e.currentTarget.style.color = 'var(--tx)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = style.background;
          e.currentTarget.style.color = style.color;
          if (variant === 'outline') {
            e.currentTarget.style.borderColor = 'var(--bg5)';
          }
        }
      }}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
}