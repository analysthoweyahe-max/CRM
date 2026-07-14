import { useQuery } from '@tanstack/react-query';
import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { campaignApi } from '../api/campaign.api';
import type { SeoTaskStatusLookupItem } from '../api/campaign.api';
import type { ComboboxItem } from '@/shared/components/form/Combobox';

/** No admin-managed phase catalog exists for SEO tasks — this is the
 *  canonical known-phase list used across SEO task create/edit forms and
 *  Kanban phase columns. */
export const SEO_TASK_PHASE_ITEMS: ComboboxItem[] = [
  { id: 'keyword_research',     label: 'بحث الكلمات المفتاحية' },
  { id: 'on_page',              label: 'داخل الصفحة'            },
  { id: 'technical',            label: 'تقنية'                  },
  { id: 'content',              label: 'محتوى'                  },
  { id: 'off_page',             label: 'خارج الصفحة'            },
  { id: 'link_building',        label: 'بناء روابط'             },
  { id: 'reporting',            label: 'تقارير'                 },
  { id: 'content_optimization', label: 'تحسين المحتوى'          },
  { id: 'technical_seo',        label: 'تحسين تقني'             },
  { id: 'competitor_analysis',  label: 'تحليل المنافسين'         },
  { id: 'on_page_seo',          label: 'تحسين على الصفحة'        },
  { id: 'off_page_seo',         label: 'تحسين خارج الصفحة'       },
];

export interface SeoTaskStatusOption {
  key:            string;
  label:          string;
  color:          string;
  sortOrder:      number;
  isActive:       boolean;
  marksCompleted: boolean;
}

export type SeoTaskStatusBadgeVariant = 'brand' | 'success' | 'gray' | 'error';

/** Badge variant is a fixed 4-color palette, but statuses are an open
 *  admin-configurable set — this heuristic covers the well-known keys and
 *  the `marksCompleted` flag, falling back to gray for anything custom. */
export function badgeVariantForStatus(key: string, marksCompleted: boolean): SeoTaskStatusBadgeVariant {
  if (marksCompleted) return 'success';
  if (key === 'in_progress' || key === 'inProgress') return 'brand';
  if (key === 'blocked') return 'error';
  return 'gray';
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
 *  real backend, so every extra field is optional with a sane fallback.
 *  Pass `enabled: false` to skip fetching for roles that never need it. */
export function useSeoTaskLookups(isAr: boolean, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const statuses = useQuery({
    queryKey: ['seo-task-lookups', 'statuses'],
    queryFn:  () => campaignApi.getTaskStatuses().then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  const priorities = useQuery({
    queryKey: ['seo-task-lookups', 'priorities'],
    queryFn:  () => campaignApi.getTaskPriorities().then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
    enabled,
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
