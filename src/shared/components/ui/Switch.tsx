interface SwitchProps {
  checked:       boolean;
  onChange:      () => void;
  ariaLabel?:    string;
}

export function Switch({ checked, onChange, ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={[
        'relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer border-0',
        checked ? 'bg-[#A0CD39]' : 'bg-gray-200 dark:bg-gray-600',
      ].join(' ')}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ insetInlineStart: checked ? '1.25rem' : '0.125rem' }}
      />
    </button>
  );
}
