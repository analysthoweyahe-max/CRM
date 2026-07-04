import { useMemo } from 'react';
import { useSeoTasks } from '@/modules/seo-member/tasks/hooks/useSeoTasks';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';

// TODO: swap for a real cross-project "today's tasks" endpoint once one exists —
// for now this derives a preview from the member's task list (nearest deadline first).
export function useTodayTasks() {
  const { data, isLoading } = useSeoTasks();

  const tasks: SeoTask[] = useMemo(() => {
    const all = data?.tasks ?? [];
    return [...all]
      .filter(t => t.status !== 'completed')
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 5);
  }, [data]);

  return { tasks, isLoading };
}
