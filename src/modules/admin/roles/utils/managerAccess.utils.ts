import { HR_CREATABLE_MANAGER_ROLES } from '../types/adminManager.types';
import { extractRoleSlug } from './role.utils';

interface EditorContext {
  isSuperAdmin: boolean;
  roles?:       string[];
}

export function isHrManager(editor: EditorContext): boolean {
  if (editor.isSuperAdmin) return false;
  return editor.roles?.some((r) => extractRoleSlug(r) === 'hr-manager') ?? false;
}

/** Whether the logged-in user may open the edit screen for a target manager. */
export function canEditManager(editor: EditorContext, targetRoles: string[]): boolean {
  const targetSlugs = targetRoles
    .map((r) => extractRoleSlug(r) ?? r)
    .filter(Boolean);

  if (targetSlugs.includes('super-admin')) return false;

  if (editor.isSuperAdmin) return true;

  if (!isHrManager(editor)) return false;

  const primary = targetSlugs[0];
  return !!primary && (HR_CREATABLE_MANAGER_ROLES as readonly string[]).includes(primary);
}

/**
 * Role options visible in the role dropdown for the current editor.
 * - Super-admin: undefined → RoleSelect shows every admin-guard role except super-admin
 * - HR manager: seo-manager + project-manager only
 * - Others: empty → role field disabled
 */
export function editableRoleNames(editor: EditorContext): string[] | undefined {
  if (editor.isSuperAdmin) return undefined;
  if (isHrManager(editor)) return [...HR_CREATABLE_MANAGER_ROLES];
  return [];
}
