import { formatDateShort } from '@/shared/utils/date.utils';
import type { EmpTaskPriority, EmpTaskStatus } from '../types/employeeTask.types';

export const PRIORITY_MAP: Record<EmpTaskPriority, { ar: string; en: string; variant: 'error' | 'warning' | 'gray' }> = {
  high:   { ar: 'عالية',   en: 'High',   variant: 'error'   },
  medium: { ar: 'متوسطة',  en: 'Medium', variant: 'warning' },
  low:    { ar: 'منخفضة',  en: 'Low',    variant: 'gray'    },
};

export const STATUS_MAP: Record<EmpTaskStatus, { ar: string; en: string; variant: 'brand' | 'success' | 'gray' }> = {
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress', variant: 'brand'   },
  completed:  { ar: 'مكتملة',      en: 'Completed',   variant: 'success' },
  pending:    { ar: 'معلقة',       en: 'Pending',     variant: 'gray'    },
};

export { formatDateShort as fmtDeadline };
