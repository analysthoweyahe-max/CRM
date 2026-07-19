import { useMemo, useState } from 'react';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useClientPage } from '@/shared/hooks/useClientPage';
import {
  homeDeadlineItems,
  matchesHomeDeadline,
  type HomeDeadlineFilter,
} from '@/shared/modules/my-tasks/utils/homeTaskDeadline.utils';
import type { EmployeeTask } from '@/modules/employee/tasks/types/employeeTask.types';

const PAGE_SIZE = 10;

export function useHomeTaskFilters(tasks: EmployeeTask[], isAr: boolean) {
  const [status, setStatus]     = useState('');
  const [project, setProject]   = useState('');
  const [deadline, setDeadline] = useState<HomeDeadlineFilter>('');

  const statusItems: ComboboxItem[] = useMemo(() => [
    { id: '', label: isAr ? 'كل الحالات' : 'All Statuses' },
    { id: 'pending',    label: isAr ? 'معلقة'        : 'Pending' },
    { id: 'inProgress', label: isAr ? 'قيد التنفيذ' : 'In Progress' },
    { id: 'completed',  label: isAr ? 'مكتملة'      : 'Completed' },
  ], [isAr]);

  const projectItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tasks) {
      if (t.projectId) {
        map.set(t.projectId, isAr ? (t.projectAr || t.projectEn) : (t.projectEn || t.projectAr));
      }
    }
    return [
      { id: '', label: isAr ? 'كل المشاريع' : 'All Projects' },
      ...[...map.entries()].map(([id, label]) => ({ id, label })),
    ];
  }, [tasks, isAr]);

  const deadlineItems = useMemo(() => homeDeadlineItems(isAr), [isAr]);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (status && task.status !== status) return false;
      if (project && task.projectId !== project) return false;
      if (!matchesHomeDeadline(task.deadline || task.dueAt, deadline, {
        isOverdue: task.isOverdue,
        isDelayed: task.isDelayed,
      })) return false;
      return true;
    });
  }, [tasks, status, project, deadline]);

  const pagination = useClientPage(filtered, PAGE_SIZE);

  function onStatus(value: string) {
    setStatus(value);
    pagination.resetPage();
  }

  function onProject(value: string) {
    setProject(value);
    pagination.resetPage();
  }

  function onDeadline(value: string) {
    setDeadline(value as HomeDeadlineFilter);
    pagination.resetPage();
  }

  return {
    status,
    project,
    deadline,
    statusItems,
    projectItems,
    deadlineItems,
    onStatus,
    onProject,
    onDeadline,
    filtered,
    ...pagination,
  };
}
