import { HR_CREATABLE_MANAGER_ROLES } from '../types/adminManager.types';

interface EditorContext {
  isSuperAdmin: boolean;
  roles?:       string[];
}

export function isHrManager(editor: EditorContext): boolean {
  if (editor.isSuperAdmin) return false;
  return editor.roles?.includes('hr-manager') ?? false;
}

/** Whether the logged-in user may open the edit screen for a target manager. */
export function canEditManager(editor: EditorContext, targetRoles: string[]): boolean {
  if (targetRoles.includes('super-admin')) return false;

  if (editor.isSuperAdmin) return true;

  if (!isHrManager(editor)) return false;

  const primary = targetRoles[0];
  return !!primary && (HR_CREATABLE_MANAGER_ROLES as readonly string[]).includes(primary);
}

/** Role options visible in the role dropdown for the current editor. */
export function editableRoleNames(editor: EditorContext): string[] | undefined {
  if (editor.isSuperAdmin) {
    return MANAGER_ROLE_NAMES;
  }
  if (isHrManager(editor)) {
    return [...HR_CREATABLE_MANAGER_ROLES];
  }
  return [];
}

const MANAGER_ROLE_NAMES = ['hr-manager', 'seo-manager', 'project-manager'];
