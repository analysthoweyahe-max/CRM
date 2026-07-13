import { useQuery } from '@tanstack/react-query';
import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { campaignApi } from '../api/campaign.api';
import type { SeoTaskStatusLookupItem } from '../api/campaign.api';

export interface SeoTaskStatusOption {
  key:            string;
  label:          string;
  color:          string;
  sortOrder:      number;
  isActive:       boolean;
  marksCompleted: boolean;
}

function normalizeStatus(item: SeoTaskStatusLookupItem, index: number, isAr: boolean): SeoTaskStatusOption {
  const key = item.key ?? item.value ?? '';
  const label = isAr
    ? (item.labelAr || item.label || key)
    : (item.labelEn || item.label || key);
  return {
    key,
    label,
    color:          item.color ?? colorForKey(key),
    sortOrder:      item.sortOrder ?? index,
    isActive:       item.isActive ?? true,
    marksCompleted: item.marksCompleted ?? (key === 'completed' || key === 'done'),
  };
}

/** Project-scoped SEO task-status/priority lookups (manager view), mirroring
 *  the PM module's usePmTaskLookups. Status shape is unverified against the
 *  real backend, so every extra field is optional with a sane fallback. */
export function useSeoTaskLookups(isAr: boolean) {
  const statuses = useQuery({
    queryKey: ['seo-task-lookups', 'statuses'],
    queryFn:  () => campaignApi.getTaskStatuses().then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const priorities = useQuery({
    queryKey: ['seo-task-lookups', 'priorities'],
    queryFn:  () => campaignApi.getTaskPriorities().then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const priorityItems = (priorities.data ?? []).map(p => ({
    id:    p.value,
    label: translateProjectLookup(p.value, p.label, isAr),
  }));

  const statusOptions = (statuses.data ?? [])
    .map((s, i) => normalizeStatus(s, i, isAr))
    .filter(s => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    statusOptions,
    priorityItems,
    isLoading: statuses.isLoading || priorities.isLoading,
  };
}
