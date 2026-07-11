import { PANEL_PERMISSION_GROUPS } from './panelPermissionCatalog';

const LABEL_BY_SLUG = new Map(
  PANEL_PERMISSION_GROUPS.flatMap((group) =>
    group.slugs.map((s) => [s.slug, { ar: s.labelAr, en: s.labelEn }] as const),
  ),
);

/** Turn `create-employee` into `Create Employee` when no catalogue entry exists. */
function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_./\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function getPermissionLabel(slug: string, isAr: boolean): string {
  const labels = LABEL_BY_SLUG.get(slug);
  if (labels) return isAr ? labels.ar : labels.en;
  // Unknown / custom permissions: English gets a readable title; Arabic keeps the slug
  // until an explicit translation is added to the catalogue.
  return isAr ? slug : humanizeSlug(slug);
}

export function getPermissionSlugsForGroup(groupKey: string): string[] {
  const group = PANEL_PERMISSION_GROUPS.find((g) => g.key === groupKey);
  return group?.slugs.map((s) => s.slug) ?? [];
}
