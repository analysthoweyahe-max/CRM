import { useQuery } from '@tanstack/react-query';
import { seoTaskApi } from '../api/seoTask.api';

export function useSeoTasks(projectUuid?: string) {
  return useQuery({
    queryKey: ['seo-member', 'tasks', projectUuid],
    queryFn:  () => seoTaskApi.list(projectUuid),
    select: res => {
      const phases = res.data.data.phases;
      const tasks  = phases.flatMap(p => p.tasks);
      const phaseNames = [...new Set(
        phases.map(p => p.phase).filter((p): p is string => !!p)
      )];
      return { tasks, phaseNames, total: res.data.data.total };
    },
    staleTime: 30_000,
  });
}
