import { Check } from 'lucide-react';

interface Props {
  label:     string;
  active:    boolean;
  onToggle?: () => void;
}

export function PermissionChip({ label, active, onToggle }: Props) {
  return (
    <button
      type="button"
      disabled={!onToggle}
      onClick={onToggle}
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
        active
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
        onToggle ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
      ].join(' ')}
    >
      {active && <Check size={11} />}
      {label}
    </button>
  );
}
