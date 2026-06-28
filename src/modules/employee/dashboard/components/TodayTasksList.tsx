import { Play, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useTaskTimer } from '@/app/layouts/components/TaskTimerContext';
export type { EmpTask } from '@/modules/employee/dashboard/types/empTask.types';
import type { EmpTask } from '@/modules/employee/dashboard/types/empTask.types';

const PRIORITY_CFG = {
  high:   { ar: 'عالية',  en: 'High',   cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'         },
  medium: { ar: 'متوسطة', en: 'Medium', cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  low:    { ar: 'منخفضة', en: 'Low',    cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'         },
};

interface TodayTasksListProps {
  tasks: EmpTask[];
  isAr:  boolean;
}

export function TodayTasksList({ tasks, isAr }: TodayTasksListProps) {
  const { activeTask, startTimer, stopTimer } = useTaskTimer();

  if (!tasks.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        {isAr ? 'لا توجد مهام اليوم' : 'No tasks for today'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => {
        const p         = PRIORITY_CFG[task.priority];
        const isActive  = activeTask?.id === task.id;

        return (
          <div
            key={task.id}
            className={[
              'bg-white dark:bg-gray-800 rounded-2xl p-4 border shadow-sm transition-all',
              isActive
                ? 'border-[#A0CD39] shadow-[#A0CD39]/20'
                : 'border-gray-100 dark:border-gray-700/60',
            ].join(' ')}
          >
            <span className={`inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2 ${p.cls}`}>
              {isAr ? p.ar : p.en}
            </span>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {isAr ? task.titleAr : task.titleEn}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{task.project}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {isAr ? 'التسليم:' : 'Due:'} {task.deadline}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <Button variant="secondary" size="sm">
                  {isAr ? 'تفاصيل' : 'Details'}
                </Button>

                {isActive ? (
                  <Button
                    size="sm"
                    variant="danger"
                    startIcon={<Square size={11} fill="currentColor" />}
                    onClick={() => stopTimer()}
                  >
                    {isAr ? 'إيقاف' : 'Stop'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    startIcon={<Play size={11} />}
                    onClick={() => startTimer(task)}
                  >
                    {isAr ? 'بدء المؤقت' : 'Start Timer'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
