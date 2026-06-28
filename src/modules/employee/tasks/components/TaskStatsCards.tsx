import { ListTodo, Play, CheckCircle2, Clock4 } from 'lucide-react';
import { useTaskStatsCards } from './useTaskStatsCards';
import type { TaskStatsCardsProps } from './TaskStatsCards.types';

const CARDS = [
  { key: null,         icon: ListTodo,      iconBg: 'bg-[#D8EBAE]',    iconCl: 'text-[#709028]',  getVal: (s: ReturnType<typeof useTaskStatsCards>) => s.total      },
  { key: 'inProgress', icon: Play,          iconBg: 'bg-blue-100',     iconCl: 'text-blue-600',   getVal: (s: ReturnType<typeof useTaskStatsCards>) => s.inProgress },
  { key: 'completed',  icon: CheckCircle2,  iconBg: 'bg-emerald-100',  iconCl: 'text-emerald-600',getVal: (s: ReturnType<typeof useTaskStatsCards>) => s.completed  },
  { key: 'pending',    icon: Clock4,        iconBg: 'bg-amber-100',    iconCl: 'text-amber-600',  getVal: (s: ReturnType<typeof useTaskStatsCards>) => s.pending    },
] as const;

const LABELS = {
  ar: { null: 'إجمالي المهام', inProgress: 'قيد التنفيذ', completed: 'مكتملة', pending: 'معلقة' },
  en: { null: 'Total Tasks',   inProgress: 'In Progress',  completed: 'Completed', pending: 'Pending' },
} as const;

export function TaskStatsCards({ tasks, isLoading, isAr, activeStatus, onFilter }: TaskStatsCardsProps) {
  const stats = useTaskStatsCards(tasks);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700" />
              <div className="space-y-2 text-end">
                <div className="h-7 w-10 rounded bg-gray-200 dark:bg-gray-600 ms-auto" />
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CARDS.map(card => {
        const Icon     = card.icon;
        const labelKey = card.key === null ? 'null' : card.key;
        const label    = isAr ? LABELS.ar[labelKey] : LABELS.en[labelKey];
        const value    = card.getVal(stats);
        const isActive = activeStatus === card.key;

        return (
          <button
            key={String(card.key)}
            type="button"
            onClick={() => onFilter(isActive ? null : card.key)}
            className={[
              'text-start bg-white dark:bg-gray-800 rounded-2xl border p-5 transition-all',
              'hover:shadow-md hover:-translate-y-0.5',
              isActive
                ? 'border-[#A0CD39]/40 shadow-md ring-2 ring-offset-1 ring-[#A0CD39]'
                : 'border-gray-100 dark:border-gray-700',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-3">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={card.iconCl} />
              </div>
              <div className="text-end">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap">{label}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
