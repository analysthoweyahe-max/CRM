import { PANEL_PERMISSION_GROUPS } from './panelPermissionCatalog';

const LABEL_BY_SLUG = new Map(
  PANEL_PERMISSION_GROUPS.flatMap((group) =>
    group.slugs.map((s) => [s.slug, { ar: s.labelAr, en: s.labelEn }] as const),
  ),
);

export function getPermissionLabel(slug: string, isAr: boolean): string {
  const labels = LABEL_BY_SLUG.get(slug);
  return labels ? (isAr ? labels.ar : labels.en) : slug;
}

export function getPermissionSlugsForGroup(groupKey: string): string[] {
  const group = PANEL_PERMISSION_GROUPS.find((g) => g.key === groupKey);
  return group?.slugs.map((s) => s.slug) ?? [];
}
