import { useState, useMemo } from 'react';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { SeoTask } from '../types/seoTask.types';

export function useSeoTaskFilters(tasks: SeoTask[], phaseNames: string[], isAr: boolean) {
  const [status,   setStatus]   = useState('');
  const [priority, setPriority] = useState('');
  const [phase,    setPhase]    = useState('');
  const [deadline, setDeadline] = useState('');

  const statusItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل الحالات'    : 'All Statuses'  },
    { id: 'pending',    label: isAr ? 'لم تبدأ بعد' : 'Not Started' },
    { id: 'inProgress', label: isAr ? 'قيد التنفيذ' : 'In Progress' },
    { id: 'completed',  label: isAr ? 'مكتملة'       : 'Completed'  },
    { id: 'blocked',    label: isAr ? 'محظورة'        : 'Blocked'    },
  ], [isAr]);

  const priorityItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل الأولويات' : 'All Priorities' },
    { id: 'high',   label: isAr ? 'عالية'   : 'High'   },
    { id: 'normal', label: isAr ? 'عادية'   : 'Normal' },
    { id: 'low',    label: isAr ? 'منخفضة'  : 'Low'    },
  ], [isAr]);

  const phaseItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل المراحل' : 'All Phases' },
    ...phaseNames.map(p => ({ id: p, label: p })),
  ], [phaseNames, isAr]);

  const deadlineItems: ComboboxItem[] = useMemo(() => [
    { id: '',        label: isAr ? 'الكل'        : 'All'        },
    { id: 'overdue', label: isAr ? 'متأخر'       : 'Overdue'   },
    { id: 'week',    label: isAr ? 'هذا الأسبوع' : 'This Week'  },
    { id: 'month',   label: isAr ? 'هذا الشهر'   : 'This Month' },
  ], [isAr]);

  const filtered = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return tasks.filter(task => {
      if (status   && task.status   !== status)             return false;
      if (priority && task.priority !== priority)           return false;
      if (phase    && (task.phase ?? '') !== phase)         return false;
      if (deadline) {
        if (!task.dueDate) return false;
        const dl = new Date(task.dueDate);
        if (deadline === 'overdue' && dl >= today)          return false;
        if (deadline === 'week') {
          const end = new Date(today); end.setDate(today.getDate() + 7);
          if (dl < today || dl > end)                       return false;
        }
        if (deadline === 'month') {
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          if (dl < today || dl > end)                       return false;
        }
      }
      return true;
    });
  }, [tasks, status, priority, phase, deadline]);

  return {
    status, setStatus,
    priority, setPriority,
    phase, setPhase,
    deadline, setDeadline,
    statusItems, priorityItems, phaseItems, deadlineItems,
    filtered,
  };
}
