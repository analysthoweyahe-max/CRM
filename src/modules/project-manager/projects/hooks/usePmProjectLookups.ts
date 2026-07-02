import { useQuery } from '@tanstack/react-query';
import { pmProjectLookupsApi } from '../api/project.api';

export function usePmProjectLookups() {
  const statuses = useQuery({
    queryKey: ['pm-project-lookups', 'statuses'],
    queryFn:  () => pmProjectLookupsApi.statuses().then(r => r.data.data),
    staleTime: Infinity,
  });

  const types = useQuery({
    queryKey: ['pm-project-lookups', 'types'],
    queryFn:  () => pmProjectLookupsApi.types().then(r => r.data.data),
    staleTime: Infinity,
  });

  return {
    statuses: statuses.data ?? [],
    types:    types.data ?? [],
    isLoading: statuses.isLoading || types.isLoading,
  };
}
