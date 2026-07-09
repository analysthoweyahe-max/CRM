import type { PmProjectTemplate } from '../types/template.types';

/**
 * Filters templates to those relevant for a given project type.
 * A template with no `projectTypeId` is treated as global (shown for every type).
 * If none of the templates carry a `projectTypeId` (backend not yet linking
 * templates to types), all templates are returned so the dropdown isn't empty.
 */
export function filterTemplatesByType(
  templates: PmProjectTemplate[],
  projectTypeId?: number | null,
): PmProjectTemplate[] {
  const anyLinked = templates.some((t) => t.projectTypeId != null);
  if (!anyLinked || projectTypeId == null) return templates;

  return templates.filter(
    (t) => t.projectTypeId == null || Number(t.projectTypeId) === Number(projectTypeId),
  );
}
