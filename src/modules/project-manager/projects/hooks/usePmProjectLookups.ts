import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/app/providers/LanguageProvider';
import { usePmProjectStatuses } from '@/modules/project-manager/project-statuses/hooks/usePmProjectStatuses';
import { pmProjectLookupsApi } from '../api/project.api';
import type { PmLookupItem } from '../types/project.types';

// The project-types lookup can come back shaped either as the generic
// {value,label} lookup pair (legacy/static lookups) or as the dynamic
// project-type record {id,name,name_ar,label} now that types are CRUD-managed —
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

// Lookups may come back as a raw array, `{ data: [...] }`, or the paginated
// `{ data: { data: [...] } }` — unwrap whichever so an empty dropdown isn't
// caused purely by a response-shape mismatch (e.g. the managers endpoint).
function toLookupArray(body: unknown): RawLookupItem[] {
  if (Array.isArray(body)) return body as RawLookupItem[];
  const data = (body as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as RawLookupItem[];
  const nested = (data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as RawLookupItem[];
  return [];
}

// `managers` is a super-admin-only lookup (assigning a project manager on
// create) — the backend 403s a regular PM/manager for it, so only fetch it
// when the caller explicitly needs it (pass includeManagers: true).
export function usePmProjectLookups(options: { includeManagers?: boolean } = {}) {
  const { includeManagers = false } = options;
  const { lang } = useLang();

  const statusesQuery = usePmProjectStatuses();
  const statuses: PmLookupItem[] = (statusesQuery.data ?? []).map(s => ({
    value:   s.value,
    label:   s.label,
    labelAr: s.labelAr ?? null,
  }));

  const types = useQuery({
    queryKey: ['pm-project-lookups', 'types', lang],
    queryFn:  () => pmProjectLookupsApi.types().then(r => toLookupArray(r.data).map(normalizeLookupItem)),
  });

  const managers = useQuery({
    queryKey: ['pm-project-lookups', 'managers'],
    queryFn:  () => pmProjectLookupsApi.managers().then(r => toLookupArray(r.data).map(normalizeLookupItem)),
    staleTime: 5 * 60 * 1000,
    enabled: includeManagers,
  });

  return {
    statuses,
    types:    types.data ?? [],
    managers: managers.data ?? [],
    isLoading: statusesQuery.isLoading || types.isLoading,
  };
}
