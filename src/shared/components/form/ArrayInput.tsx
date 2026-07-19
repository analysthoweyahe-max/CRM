import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

export interface ArrayInputProps {
  values:       string[];
  type?:        'text' | 'url';
  placeholder?: string;
  addLabel:     string;
  onAdd:        () => void;
  onUpdate:     (i: number, v: string) => void;
  onRemove:     (i: number) => void;
  /** Keep at least this many rows (default 1 — campaign keywords/links). Use 0 for optional lists. */
  minItems?:    number;
  dir?:         'ltr' | 'rtl';
  error?:       boolean;
}

export function ArrayInput({
  values, type = 'text', placeholder, addLabel,
  onAdd, onUpdate, onRemove,
  minItems = 1,
  dir,
  error,
}: ArrayInputProps) {
  const inputClass = [
    INPUT,
    'flex-1',
    error ? 'border-red-400 dark:border-red-500 focus:ring-red-400/40' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2.5">
      {values.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type={type}
            value={val}
            onChange={e => onUpdate(i, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
            dir={dir}
          />
          {values.length > minItems && (
            <Button variant="icon-danger" onClick={() => onRemove(i)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        startIcon={<Plus size={15} />}
        onClick={onAdd}
        className="text-[#709028] dark:text-[#A0CD39]"
      >
        {addLabel}
      </Button>
    </div>
  );
}
