import { useState, useMemo } from 'react';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { EmployeeTask } from '../types/employeeTask.types';

export function useTaskFilters(tasks: EmployeeTask[], isAr: boolean) {
  const [status,   setStatus]   = useState('');
  const [priority, setPriority] = useState('');
  const [project,  setProject]  = useState('');
  const [deadline, setDeadline] = useState('');

  const statusItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل الحالات'    : 'All Statuses'    },
    { id: 'inProgress', label: isAr ? 'قيد التنفيذ' : 'In Progress' },
    { id: 'completed',  label: isAr ? 'مكتملة'      : 'Completed'   },
    { id: 'pending',    label: isAr ? 'معلقة'        : 'Pending'     },
  ], [isAr]);

  const priorityItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل الأولويات' : 'All Priorities' },
    { id: 'high',   label: isAr ? 'عالية'   : 'High'   },
    { id: 'medium', label: isAr ? 'متوسطة'  : 'Medium' },
    { id: 'low',    label: isAr ? 'منخفضة'  : 'Low'    },
  ], [isAr]);

  const projectItems: ComboboxItem[] = useMemo(() => {
    const projects = [...new Set(tasks.map(t => isAr ? t.projectAr : t.projectEn))];
    return [
      { id: '', label: isAr ? 'كل المشاريع' : 'All Projects' },
      ...projects.map(p => ({ id: p, label: p })),
    ];
  }, [tasks, isAr]);

  const deadlineItems: ComboboxItem[] = useMemo(() => [
    { id: '',        label: isAr ? 'الكل'           : 'All'         },
    { id: 'overdue', label: isAr ? 'متأخر'          : 'Overdue'     },
    { id: 'week',    label: isAr ? 'هذا الأسبوع'    : 'This Week'   },
    { id: 'month',   label: isAr ? 'هذا الشهر'     : 'This Month'  },
  ], [isAr]);

  const filtered = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return tasks.filter(task => {
      if (status   && task.status   !== status)   return false;
      if (priority && task.priority !== priority) return false;
      if (project) {
        if ((isAr ? task.projectAr : task.projectEn) !== project) return false;
      }
      if (deadline) {
        const dl = new Date(task.deadline);
        if (deadline === 'overdue' && dl >= today) return false;
        if (deadline === 'week') {
          const end = new Date(today); end.setDate(today.getDate() + 7);
          if (dl < today || dl > end) return false;
        }
        if (deadline === 'month') {
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          if (dl < today || dl > end) return false;
        }
      }
      return true;
    });
  }, [tasks, status, priority, project, deadline, isAr]);

  return {
    status, setStatus, priority, setPriority, project, setProject, deadline, setDeadline,
    statusItems, priorityItems, projectItems, deadlineItems, filtered,
  };
}
