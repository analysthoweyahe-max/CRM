import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useEndDayForm } from './useEndDayForm';
import type { EndDayFormProps } from './EndDayForm.types';

function EndDayFormSkeleton() {
  return (
    <Card padding="md">
      <div className="space-y-6">
        <div className="h-5 w-40 rounded-lg bg-gray-200 dark:bg-gray-600 animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          {[0, 1].map(i => (
            <div key={i} className="flex items-center justify-between py-1" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-4 w-48 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-12 rounded bg-brand-100 dark:bg-brand-900/30 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-24 w-full rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
    </Card>
  );
}

export function EndDayForm({ isAr }: EndDayFormProps) {
  const { tasks, isLoading, reflection, setReflection, isPending, handleSubmit } = useEndDayForm(isAr);

  if (isLoading) return <EndDayFormSkeleton />;

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-start">
          {isAr ? 'تقرير نهاية اليوم' : 'End of Day Report'}
        </h2>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
            {isAr ? 'المهام التي تم العمل عليها (تلقائياً من المؤقت)' : 'Tasks Worked On (auto from timer)'}
          </p>
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">{task.name}</span>
              <span className="text-sm font-semibold text-brand-600">
                {isAr ? `س ${task.actualHours}` : `${task.actualHours}h`}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-start">
            {isAr ? 'ملاحظات وتأملات' : 'Notes & Reflections'}
          </p>
          <textarea
            value={reflection} onChange={e => setReflection(e.target.value)} rows={4}
            placeholder={isAr ? 'ملخص اليوم...' : 'Day summary...'}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 p-3 text-start outline-none resize-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
          />
        </div>

        <Button type="submit" isLoading={isPending} className="px-6">
          {isAr ? 'إرسال للمدير' : 'Send to Manager'}
        </Button>
      </form>
    </Card>
  );
}
