import { useStore } from '../store/useStore';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function Toggle({ value, onChange }: ToggleProps) {
  const { theme } = useStore();

  return (
    <div
      onClick={() => onChange(!value)}
      className="relative cursor-pointer transition-all flex-shrink-0"
      style={{
        width: 38,
        height: 21,
        borderRadius: 11,
        background: value ? 'var(--ac)' : 'var(--bg5)',
      }}
    >
      <div
        className="absolute top-0.5 rounded-full transition-all"
        style={{
          width: 16,
          height: 16,
          background: '#fff',
          left: value ? 19 : 2.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'left 0.18s',
        }}
      />
    </div>
  );
}