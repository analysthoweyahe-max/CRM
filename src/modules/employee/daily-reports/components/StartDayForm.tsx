import { CheckSquare } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useStartDayForm } from './useStartDayForm';
import type { StartDayFormProps } from './StartDayForm.types';

function StartDayFormSkeleton() {
  return (
    <Card padding="md">
      <div className="space-y-6">
        <div className="h-5 w-40 rounded-lg bg-gray-200 dark:bg-gray-600 animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 w-48 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          {[0, 1].map(i => (
            <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
              <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div className="w-16 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-24 w-full rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
    </Card>
  );
}

export function StartDayForm({ isAr }: StartDayFormProps) {
  const { tasks, isLoading, hours, setTaskHours, notes, setNotes, isPending, handleSubmit } = useStartDayForm(isAr);

  if (isLoading) return <StartDayFormSkeleton />;

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-start">
          {isAr ? 'تقرير بداية اليوم' : 'Start of Day Report'}
        </h2>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
            {isAr ? 'المهام المخططة لليوم' : 'Planned Tasks for Today'}
          </p>
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3">
              <CheckSquare size={18} className="text-brand-500 shrink-0" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 text-start">{task.name}</span>
              <input
                type="number" min={0} max={24} step={0.5}
                value={hours[task.id] ?? ''}
                onChange={e => setTaskHours(task.id, Number(e.target.value))}
                className="w-16 h-9 text-center rounded-lg border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-700/50 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
            {isAr ? 'ملاحظات أو معوقات' : 'Notes or Obstacles'}
          </p>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)} rows={4}
            placeholder={isAr ? 'أي معوقات متوقعة...' : 'Any expected obstacles...'}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 p-3 text-start outline-none resize-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
          />
        </div>

        <Button type="submit" isLoading={isPending} className="px-6">
          {isAr ? 'حفظ التقرير' : 'Save Report'}
        </Button>
      </form>
    </Card>
  );
}
