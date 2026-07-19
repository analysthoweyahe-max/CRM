import { useQuery } from '@tanstack/react-query';
import { seoTaskApi } from '../api/seoTask.api';
import type { SeoTaskProjectRef } from '../types/seoTask.types';

export function useSeoTasks() {
  return useQuery({
    queryKey: ['seo-member', 'tasks'],
    // Per-project fetch + flatMap — cross-project aggregate is unreliable.
    queryFn:  () => seoTaskApi.listMineAggregated(),
    select: ({ tasks, total }) => {
      const phaseNames = [...new Set(
        tasks.map((t) => t.phase).filter((p): p is string => !!p),
      )];
      const projectsById = new Map<string, SeoTaskProjectRef>();
      tasks.forEach((t) => { if (t.project) projectsById.set(t.project.id, t.project); });
      return { tasks, phaseNames, projects: [...projectsById.values()], total };
    },
    staleTime: 30_000,
  });
}
