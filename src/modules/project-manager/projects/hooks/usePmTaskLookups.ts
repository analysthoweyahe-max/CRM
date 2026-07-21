import { useQuery } from '@tanstack/react-query';
import {
  toActiveProjectStatusOptions,
  unwrapProjectStatusArray,
} from '@/shared/utils/projectStatusLookups.utils';
import { pmProjectLookupsApi } from '../api/project.api';

export function usePmTaskLookups() {
  const statuses = useQuery({
    queryKey: ['pm-task-lookups', 'statuses'],
    queryFn: () =>
      pmProjectLookupsApi.taskStatuses().then((r) =>
        toActiveProjectStatusOptions(unwrapProjectStatusArray(r.data.data)),
      ),
    staleTime: Infinity,
  });

  const priorities = useQuery({
    queryKey: ['pm-task-lookups', 'priorities'],
    queryFn: () => pmProjectLookupsApi.taskPriorities().then((r) => r.data.data),
    staleTime: Infinity,
  });

  return {
    statuses: statuses.data ?? [],
    priorities: priorities.data ?? [],
    isLoading: statuses.isLoading || priorities.isLoading,
  };
}
