/** Recommended permission set for the project-manager role (assign via Admin → Roles). */
export const PM_ROLE_PERMISSIONS = [
  'view-pm-projects',
  'create-pm-project',
  'edit-pm-project',
  'delete-pm-project',
  'view-pm-team',
  'view-pm-reports',
] as const;

export type PmPermissionSlug = (typeof PM_ROLE_PERMISSIONS)[number];
