import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { filterPmTeamMembers } from '@/shared/modules/team/utils/teamScope.utils';
import { fetchAllMembers } from './useProjectTeamPage';

/**
 * Same scoping as the "Work Team" page (excludes SEO-department members and,
 * for non-admins, scopes to the viewer's own team) — the dashboard stat card
 * must always match what "أعضاء الفريق" actually lists, not the raw
 * unfiltered /v1/pm/team total (which can include other departments).
 */
export function usePmTeamCount() {
  const { user } = useAuth();

  const { data: allMembers } = useQuery({
    queryKey: ['pm-team-count', 'all-members'],
    queryFn:  fetchAllMembers,
    staleTime: 60_000,
  });

  if (!allMembers) return 0;

  return filterPmTeamMembers(allMembers, {
    viewerId: user?.employeeId,
    isAdmin:  user?.role === 'admin',
  }).length;
}
