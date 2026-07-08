import { useQuery } from '@tanstack/react-query';
import { pmProjectLookupsApi } from '../api/project.api';
import type { PmLookupItem } from '../types/project.types';

// The project-types lookup can come back shaped either as the generic
// {value,label} lookup pair (legacy/static lookups) or as the dynamic
// project-type record {id,name,name_ar} now that types are CRUD-managed —
// normalize both into PmLookupItem so downstream code never has to care.
interface RawLookupItem {
  value?:   string | number | null;
  label?:   string | null;
  labelAr?: string | null;
  id?:      string | number | null;
  name?:    string | null;
  name_ar?: string | null;
  nameAr?:  string | null;
}

function normalizeLookupItem(raw: RawLookupItem): PmLookupItem {
  return {
    value:   String(raw.value ?? raw.id ?? ''),
    label:   String(raw.label ?? raw.name ?? ''),
    labelAr: raw.labelAr ?? raw.name_ar ?? raw.nameAr ?? null,
  };
}

// `managers` is a super-admin-only lookup (assigning a project manager on
// create) — the backend 403s a regular PM/manager for it, so only fetch it
// when the caller explicitly needs it (pass includeManagers: true).
export function usePmProjectLookups(options: { includeManagers?: boolean } = {}) {
  const { includeManagers = false } = options;

  const statuses = useQuery({
    queryKey: ['pm-project-lookups', 'statuses'],
    queryFn:  () => pmProjectLookupsApi.statuses().then(r => (r.data.data ?? []).map(normalizeLookupItem)),
    staleTime: Infinity,
  });

  const types = useQuery({
    queryKey: ['pm-project-lookups', 'types'],
    queryFn:  () => pmProjectLookupsApi.types().then(r => (r.data.data ?? []).map(normalizeLookupItem)),
  });

  const managers = useQuery({
    queryKey: ['pm-project-lookups', 'managers'],
    queryFn:  () => pmProjectLookupsApi.managers().then(r => (r.data.data ?? []).map(normalizeLookupItem)),
    staleTime: 5 * 60 * 1000,
    enabled: includeManagers,
  });

  return {
    statuses: statuses.data ?? [],
    types:    types.data ?? [],
    managers: managers.data ?? [],
    isLoading: statuses.isLoading || types.isLoading,
  };
}
