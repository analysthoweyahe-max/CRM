import { useState }    from 'react';
import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Button }      from '@/shared/components/ui/Button';

export interface PhaseItem {
  id:        string;
  label:     string;
  duration?: string;
}

interface Props {
  phases:     PhaseItem[];
  onAdd:      (label: string) => void;
  onDelete:   (id: string) => void;
  onMoveUp:   (id: string) => void;
  onMoveDown: (id: string) => void;
  isAr:       boolean;
}

const INPUT = [
  'flex-1 rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

export function PhasesManagerUI({ phases, onAdd, onDelete, onMoveUp, onMoveDown, isAr }: Props) {
  const [newLabel, setNewLabel] = useState('');

  function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;
    onAdd(label);
    setNewLabel('');
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 text-end">
        {isAr ? 'إدارة المراحل' : 'Phases Management'}
      </h2>

      <ul className="space-y-2">
        {phases.map((phase, idx) => (
          <li
            key={phase.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5"
          >
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onMoveUp(phase.id)}
                disabled={idx === 0}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp size={15} />
              </button>
              <button
                onClick={() => onMoveDown(phase.id)}
                disabled={idx === phases.length - 1}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown size={15} />
              </button>
              <button
                onClick={() => onDelete(phase.id)}
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              {phase.duration && (
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  ({phase.duration})
                </span>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-end truncate">
                {phase.label}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          startIcon={<Plus size={15} />}
          disabled={!newLabel.trim()}
          onClick={handleAdd}
        >
          {isAr ? 'إضافة' : 'Add'}
        </Button>
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={isAr ? 'اسم المرحلة الجديدة...' : 'New phase name…'}
          className={INPUT}
        />
      </div>
    </div>
  );
}
