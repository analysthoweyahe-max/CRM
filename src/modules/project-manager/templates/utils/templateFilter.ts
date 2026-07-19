import type { PmProjectTemplate } from '../types/template.types';

/**
 * Linked type IDs — prefers `projectTypeIds`, then `projectTypes`, then legacy single id.
 * Empty array = global template.
 */
export function templateProjectTypeIds(template: PmProjectTemplate): number[] {
  if (Array.isArray(template.projectTypeIds)) {
    return template.projectTypeIds.map(Number).filter((n) => !Number.isNaN(n));
  }
  if (Array.isArray(template.projectTypes) && template.projectTypes.length > 0) {
    return template.projectTypes.map((t) => Number(t.id)).filter((n) => !Number.isNaN(n));
  }
  if (template.projectTypeId != null) {
    const n = Number(template.projectTypeId);
    return Number.isNaN(n) ? [] : [n];
  }
  return [];
}

export function isGlobalTemplate(template: PmProjectTemplate): boolean {
  return templateProjectTypeIds(template).length === 0;
}

/**
 * Client-side safety filter. Prefer fetching with `?project_type_id=` from the API.
 * Global templates (no linked types) match every project type.
 */
export function filterTemplatesByType(
  templates: PmProjectTemplate[],
  projectTypeId?: number | null,
): PmProjectTemplate[] {
  if (projectTypeId == null) return templates;

  const target = Number(projectTypeId);
  return templates.filter((t) => {
    const ids = templateProjectTypeIds(t);
    return ids.length === 0 || ids.includes(target);
  });
}
