import { useMemo } from 'react';
import { useSeoTasks } from '@/modules/seo-member/tasks/hooks/useSeoTasks';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';

/** Flat list of the member's tasks (nearest deadline first) for the home dashboard. */
export function useTodayTasks() {
  const { data, isLoading } = useSeoTasks();

  const tasks: SeoTask[] = useMemo(() => {
    const all = data?.tasks ?? [];
    return [...all].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [data]);

  return { tasks, isLoading };
}
