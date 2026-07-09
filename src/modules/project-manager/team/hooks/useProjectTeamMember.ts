import { useEffect, useState } from 'react';
import { fetchAllMembers } from './useProjectTeamPage';
import type { PmTeamMemberApi } from '../types/team.types';

export function useProjectTeamMember(id: string | undefined, initial?: PmTeamMemberApi | null) {
  const [member,    setMember]    = useState<PmTeamMemberApi | null>(initial ?? null);
  const [isLoading, setIsLoading] = useState(!initial);

  useEffect(() => {
    if (initial || !id) return;

    let cancelled = false;
    setIsLoading(true);
    fetchAllMembers()
      .then(members => {
        if (!cancelled) setMember(members.find(m => m.id === id) ?? null);
      })
      .catch(() => { /* leave previous state on error */ })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id, initial]);

  return { member, isLoading };
}
