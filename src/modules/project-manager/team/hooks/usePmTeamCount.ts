import { useQuery } from '@tanstack/react-query';
import { pmTeamApi } from '../api/team.api';

/**
 * GET /v1/pm/team is scoped server-side to the PM department (SEO excluded),
 * so its `total` is already the correct count — no client-side recount/filter needed.
 */
export function usePmTeamCount() {
  const { data: total } = useQuery({
    queryKey: ['pm-team-count'],
    queryFn:  () => pmTeamApi.list({ per_page: 1, page: 1 }).then(res => res.data.data.total),
    staleTime: 60_000,
  });

  return total ?? 0;
}
