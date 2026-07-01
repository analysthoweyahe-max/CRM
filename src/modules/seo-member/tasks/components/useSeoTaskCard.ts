import { fmtDeadline } from '@/modules/employee/tasks/components/useTasksTable';
import type { EmpTask } from '@/modules/employee/dashboard/types/empTask.types';
import type { SeoTask, SeoTaskPriority, SeoTaskStatus } from '../types/seoTask.types';

const STATUS_MAP: Record<SeoTaskStatus, { ar: string; en: string; variant: 'brand' | 'success' | 'gray' | 'error' }> = {
  pending:    { ar: 'لم تبدأ بعد', en: 'Not Started', variant: 'gray'    },
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress',  variant: 'brand'   },
  completed:  { ar: 'مكتملة',      en: 'Completed',    variant: 'success' },
  blocked:    { ar: 'محظورة',      en: 'Blocked',      variant: 'error'   },
};

const PRIORITY_MAP: Record<SeoTaskPriority, { ar: string; en: string; variant: 'error' | 'warning' | 'gray' }> = {
  high:   { ar: 'عالية',  en: 'High',   variant: 'error'   },
  normal: { ar: 'عادية',  en: 'Normal', variant: 'warning' },
  low:    { ar: 'منخفضة', en: 'Low',    variant: 'gray'    },
};

export function useSeoTaskCard(task: SeoTask, isAr: boolean) {
  const status   = STATUS_MAP[task.status]   ?? STATUS_MAP.pending;
  const priority = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.normal;
  const taskNum  = `#${task.taskNumber.toString().padStart(3, '0')}`;
  const deadline = task.dueDate
    ? fmtDeadline(task.dueDate, isAr)
    : isAr ? 'غير محدد' : 'No date';

  const empTask: EmpTask = {
    id: String(task.id),
    titleAr: task.title,
    titleEn: task.title,
    project: task.phase ?? task.taskTypeLabel,
    deadline: task.dueDate ?? '—',
    priority: task.priority === 'normal' ? 'medium' : (task.priority as 'high' | 'low'),
  };

  return { status, priority, taskNum, deadline, empTask };
}
