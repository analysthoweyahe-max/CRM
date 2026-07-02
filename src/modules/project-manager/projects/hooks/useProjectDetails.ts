import { useQuery } from '@tanstack/react-query';
import { pmProjectsApi } from '../api/project.api';

export function useProjectDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: ['pm-project', id],
    queryFn:  () => pmProjectsApi.get(id!).then(r => r.data.data),
    enabled:  !!id,
  });

  return { project: query.data, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}
