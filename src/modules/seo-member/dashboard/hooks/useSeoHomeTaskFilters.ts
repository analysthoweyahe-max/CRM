import { useEffect, useMemo, useState } from 'react';
import { useClientPage } from '@/shared/hooks/useClientPage';
import {
  homeDeadlineItems,
  matchesHomeDeadline,
  type HomeDeadlineFilter,
} from '@/shared/modules/my-tasks/utils/homeTaskDeadline.utils';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';
import { buildSeoTaskStatusItems } from '../utils/seoTaskStatusStats.utils';

const PAGE_SIZE = 10;

interface UseSeoHomeTaskFiltersOptions {
  externalStatus?: string;
}

export function useSeoHomeTaskFilters(
  tasks: SeoTask[],
  isAr: boolean,
  options?: UseSeoHomeTaskFiltersOptions,
) {
  const [status, setStatus]     = useState(options?.externalStatus ?? '');
  const [project, setProject]   = useState('');
  const [deadline, setDeadline] = useState<HomeDeadlineFilter>('');

  useEffect(() => {
    if (options?.externalStatus !== undefined) {
      setStatus(options.externalStatus);
    }
  }, [options?.externalStatus]);

  const statusItems = useMemo(() => buildSeoTaskStatusItems(tasks, isAr), [tasks, isAr]);

  const projectItems = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tasks) {
      if (t.project?.id) map.set(t.project.id, t.project.name);
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
      if (project && task.project?.id !== project) return false;
      if (!matchesHomeDeadline(task.dueDate || task.dueAt, deadline, {
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
