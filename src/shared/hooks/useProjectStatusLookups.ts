import { useQuery } from '@tanstack/react-query';
import { pmProjectStatusApi } from '@/modules/project-manager/project-statuses/api/pmProjectStatus.api';
import { seoProjectStatusApi } from '@/modules/admin/seo-project-statuses/api/seoProjectStatus.api';
import type { MyProjectsModule } from '@/shared/modules/my-projects/types/myProjects.types';

/** Active project-status catalog — shares cache with usePmProjectStatuses / useSeoProjectStatuses. */
export function useProjectStatusLookups(module: MyProjectsModule, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: module === 'pm' ? ['pm', 'project-statuses'] as const : ['seo', 'project-statuses'] as const,
    queryFn:  () => (module === 'pm' ? pmProjectStatusApi.listActive() : seoProjectStatusApi.listActive()),
    staleTime: Infinity,
    enabled,
  });
}
