import type { PmProjectTemplate } from '../types/template.types';

/** Normalize linked type IDs from multi or legacy single fields. */
export function templateProjectTypeIds(template: PmProjectTemplate): number[] {
  if (Array.isArray(template.projectTypeIds) && template.projectTypeIds.length > 0) {
    return template.projectTypeIds.map(Number).filter((n) => !Number.isNaN(n));
  }
  if (template.projectTypeId != null && template.projectTypeId !== undefined) {
    const n = Number(template.projectTypeId);
    return Number.isNaN(n) ? [] : [n];
  }
  return [];
}

/**
 * Filters templates to those relevant for a given project type.
 * A template with no linked types is treated as global (shown for every type).
 * If none of the templates carry type links (backend not yet linking
 * templates to types), all templates are returned so the dropdown isn't empty.
 */
export function filterTemplatesByType(
  templates: PmProjectTemplate[],
  projectTypeId?: number | null,
): PmProjectTemplate[] {
  const anyLinked = templates.some((t) => templateProjectTypeIds(t).length > 0);
  if (!anyLinked || projectTypeId == null) return templates;

  const target = Number(projectTypeId);
  return templates.filter((t) => {
    const ids = templateProjectTypeIds(t);
    return ids.length === 0 || ids.includes(target);
  });
}
