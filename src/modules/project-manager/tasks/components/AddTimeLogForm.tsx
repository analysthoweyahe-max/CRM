import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

const INPUT = [
  'w-full rounded-lg border border-gray-200 dark:border-gray-600',
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-[#A0CD39] focus:border-transparent',
].join(' ');

interface Props {
  onSubmit:   (payload: { workDate: string; startedAt: string; endedAt: string; notes: string }) => void;
  submitting: boolean;
  isAr:       boolean;
}

export function AddTimeLogForm({ onSubmit, submitting, isAr }: Props) {
  const [date,  setDate]  = useState('');
  const [start, setStart] = useState('');
  const [end,   setEnd]   = useState('');
  const [notes, setNotes] = useState('');

  const isValid = !!(date && start && end);

  function handleSubmit() {
    if (!isValid || submitting) return;
    onSubmit({ workDate: date, startedAt: start, endedAt: end, notes });
    setDate(''); setStart(''); setEnd(''); setNotes('');
  }

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
        {isAr ? 'تسجيل وقت جديد' : 'Log New Session'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input type="date" value={date}  onChange={e => setDate(e.target.value)}  className={INPUT} />
        <input type="time" value={start} onChange={e => setStart(e.target.value)} className={INPUT} />
        <input type="time" value={end}   onChange={e => setEnd(e.target.value)}   className={INPUT} />
      </div>
      <input
        type="text"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder={isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
        className={INPUT}
      />
      <Button
        variant="secondary"
        size="sm"
        startIcon={<Plus size={14} />}
        disabled={!isValid || submitting}
        onClick={handleSubmit}
      >
        {isAr ? 'إضافة' : 'Add'}
      </Button>
    </div>
  );
}
