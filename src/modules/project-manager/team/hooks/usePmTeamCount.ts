import { useQuery } from '@tanstack/react-query';
import { pmTeamApi } from '../api/team.api';

export function usePmTeamCount() {
  const { data } = useQuery({
    queryKey: ['pm-team-count'],
    queryFn:  () => pmTeamApi.list({ per_page: 1 }).then(r => r.data.data.total),
    staleTime: 60_000,
  });

  return data ?? 0;
}
