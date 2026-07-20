import type { ComboboxItem } from '@/shared/components/form/Combobox';
import type { SeoTaskStatusOption } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';

export interface SeoTaskStatusStat {
  key:   string;
  label: string;
  count: number;
  color: string | null;
}

/** Flat-map task statuses from the API — same keys/labels as the status combobox. */
export function buildSeoTaskStatusStats(
  tasks: SeoTask[],
  statusOptions: SeoTaskStatusOption[] = [],
): SeoTaskStatusStat[] {
  const byKey = new Map<string, { label: string; count: number }>();

  for (const task of tasks) {
    if (!task.status) continue;
    const existing = byKey.get(task.status);
    if (existing) {
      existing.count += 1;
    } else {
      byKey.set(task.status, {
        label: task.statusLabel || task.status,
        count: 1,
      });
    }
  }

  const colorByKey = Object.fromEntries(statusOptions.map(s => [s.key, s.color]));
  const orderByKey = Object.fromEntries(statusOptions.map(s => [s.key, s.sortOrder]));

  return [...byKey.entries()]
    .map(([key, { label, count }]) => ({
      key,
      label,
      count,
      color: colorByKey[key] ?? null,
    }))
    .sort((a, b) => (orderByKey[a.key] ?? 999) - (orderByKey[b.key] ?? 999));
}

export function buildSeoTaskStatusItems(tasks: SeoTask[], isAr: boolean): ComboboxItem[] {
  const map = new Map<string, string>();
  for (const task of tasks) {
    if (task.status) map.set(task.status, task.statusLabel || task.status);
  }
  return [
    { id: '', label: isAr ? 'كل الحالات' : 'All Statuses' },
    ...[...map.entries()].map(([id, label]) => ({ id, label })),
  ];
}
