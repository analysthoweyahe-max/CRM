import type { StatusLookupItem } from '@/shared/modules/my-projects/types/myProjects.types';

/** Raw shape from GET /v1/{pm|seo}/project-statuses or legacy lookups/statuses. */
export interface RawProjectStatusItem {
  id?:             number | string | null;
  key?:            string | null;
  value?:          string | null;
  label?:          string | null;
  labelEn?:        string | null;
  label_en?:       string | null;
  labelAr?:        string | null;
  label_ar?:       string | null;
  color?:          string | null;
  sortOrder?:      number | null;
  sort_order?:     number | null;
  isActive?:       boolean | null;
  is_active?:      boolean | null;
  marksCompleted?: boolean | null;
  marks_completed?: boolean | null;
}

export interface ProjectStatusOption extends StatusLookupItem {
  color?:          string;
  sortOrder?:      number;
  isActive?:       boolean;
  marksCompleted?: boolean;
}

function readDisplayLabel(raw: RawProjectStatusItem): string {
  const key = projectStatusKey(raw);
  return String(raw.label ?? raw.labelEn ?? raw.label_en ?? key);
}

function readLabelAr(raw: RawProjectStatusItem): string | null {
  return raw.labelAr ?? raw.label_ar ?? null;
}

export function projectStatusKey(raw: RawProjectStatusItem): string {
  return String(raw.key ?? raw.value ?? '');
}

export function normalizeProjectStatusItem(raw: RawProjectStatusItem, index = 0): ProjectStatusOption {
  const value = projectStatusKey(raw);
  return {
    value,
    label:          readDisplayLabel(raw) || value,
    labelAr:        readLabelAr(raw),
    color:          raw.color ?? undefined,
    sortOrder:      raw.sortOrder ?? raw.sort_order ?? index,
    isActive:       raw.isActive ?? raw.is_active ?? true,
    marksCompleted: raw.marksCompleted ?? raw.marks_completed ?? (value === 'completed'),
  };
}

export function toActiveProjectStatusLookups(items: RawProjectStatusItem[]): StatusLookupItem[] {
  return items
    .map((item, index) => normalizeProjectStatusItem(item, index))
    .filter(item => item.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(({ value, label, labelAr }) => ({ value, label, labelAr }));
}

export function toActiveProjectStatusOptions(items: RawProjectStatusItem[]): ProjectStatusOption[] {
  return items
    .map((item, index) => normalizeProjectStatusItem(item, index))
    .filter(item => item.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function unwrapProjectStatusArray(body: unknown): RawProjectStatusItem[] {
  if (Array.isArray(body)) return body as RawProjectStatusItem[];
  const data = (body as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as RawProjectStatusItem[];
  const nested = (data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as RawProjectStatusItem[];
  return [];
}
