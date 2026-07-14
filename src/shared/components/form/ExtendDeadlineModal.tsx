import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

export type ExtendDeadlinePayload =
  | { extra_days: number }
  | { due_date: string }
  | { extra_hours: number };

type ExtendMode = 'days' | 'date' | 'hours';

const INPUT = [
  'w-full rounded-xl border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-4 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
  'transition-shadow duration-150',
].join(' ');

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (payload: ExtendDeadlinePayload) => void;
  isSaving?: boolean;
  isAr:      boolean;
}

export function ExtendDeadlineModal({ open, onClose, onSubmit, isSaving, isAr }: Props) {
  const [mode, setMode] = useState<ExtendMode>('days');
  const [days, setDays] = useState('1');
  const [hours, setHours] = useState('1');
  const [date, setDate] = useState('');

  function reset() {
    setMode('days');
    setDays('1');
    setHours('1');
    setDate('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (mode === 'days') {
      const n = Number(days);
      if (!n || n <= 0) return;
      onSubmit({ extra_days: n });
    } else if (mode === 'hours') {
      const n = Number(hours);
      if (!n || n <= 0) return;
      onSubmit({ extra_hours: n });
    } else {
      if (!date) return;
      onSubmit({ due_date: date });
    }
  }

  const modes: { key: ExtendMode; ar: string; en: string }[] = [
    { key: 'days',  ar: 'أيام إضافية',  en: 'Extra days'    },
    { key: 'date',  ar: 'تاريخ محدد',   en: 'Specific date' },
    { key: 'hours', ar: 'ساعات إضافية', en: 'Extra hours'   },
  ];

  const canSubmit =
    mode === 'days'  ? Number(days)  > 0 :
    mode === 'hours' ? Number(hours) > 0 :
    !!date;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'تمديد الموعد النهائي' : 'Extend Deadline'}
      size="sm"
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit || isSaving} isLoading={isSaving}>
            {isAr ? 'تمديد' : 'Extend'}
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
          {modes.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={[
                'flex-1 py-2 text-sm font-medium transition-colors',
                mode === m.key
                  ? 'bg-[#A0CD39] text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {isAr ? m.ar : m.en}
            </button>
          ))}
        </div>

        {mode === 'days' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-end">
              {isAr ? 'عدد الأيام' : 'Number of days'}
            </label>
            <input type="number" min={1} value={days} onChange={e => setDays(e.target.value)} className={INPUT} />
          </div>
        )}
        {mode === 'hours' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-end">
              {isAr ? 'عدد الساعات' : 'Number of hours'}
            </label>
            <input type="number" min={1} value={hours} onChange={e => setHours(e.target.value)} className={INPUT} />
          </div>
        )}
        {mode === 'date' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-end">
              {isAr ? 'الموعد الجديد' : 'New due date'}
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={INPUT} />
          </div>
        )}
      </div>
    </Modal>
  );
}
