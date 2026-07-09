// ── Legacy mock model ──────────────────────────────────────────────────────
// Still used by the employee-detail "Custom Permissions" card, which stays
// mock until a per-employee permissions endpoint exists.
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

export interface ModuleDef {
  key:     string;
  labelAr: string;
  labelEn: string;
  actions: PermissionAction[];
}

// ── Real API model (GET/POST/DELETE /v1/roles) ──────────────────────────────

export interface ApiRole {
  id:          number;
  name:        string;
  guardName:   'admin' | 'web' | 'employee';
  permissions: string[];
  createdAt:   string;
  updatedAt:   string;
}

export interface RoleListResponse {
  status:  string;
  message: string;
  data:    ApiRole[];
}

export interface RoleSingleResponse {
  status:  string;
  message: string | number; // backend sometimes returns the HTTP status code (e.g. 201) as `message`
  data:    ApiRole;
}

// The backend returns the refreshed full roles list on update/delete instead of a bare ack.
export type UpdateRoleResponse = RoleListResponse;
export type DeleteRoleResponse = RoleListResponse;

export interface CreateRolePayload {
  name:        string;
  permissions: string[];
  guard_name:  ApiRole['guardName'];
}

export type UpdateRolePayload = CreateRolePayload;

export interface RoleFormInput {
  name:        string;
  permissions: string[];
}

// ── Shared permission catalogue ──────────────────────────────────────────────
// Every slug below was observed on real roles returned by GET /v1/roles.

export interface PermissionSlugDef {
  slug:    string;
  labelAr: string;
  labelEn: string;
}

export interface PermissionGroup {
  key:     string;
  labelAr: string;
  labelEn: string;
  slugs:   PermissionSlugDef[];
}

export { PANEL_PERMISSION_GROUPS as PERMISSION_GROUPS } from '@/shared/permissions/panelPermissionCatalog';

const ROLE_NAME_LABEL: Record<string, { ar: string; en: string }> = {
  'super-admin':     { ar: 'مشرف عام',         en: 'Super Admin'     },
  'hr-manager':      { ar: 'مدير موارد بشرية', en: 'HR Manager'      },
  'project-manager': { ar: 'مدير مشاريع',      en: 'Project Manager' },
  'seo-manager':     { ar: 'مدير SEO',         en: 'SEO Manager'     },
  'pm-employee':     { ar: 'موظف مشاريع',     en: 'PM Employee'     },
  'seo-employee':    { ar: 'موظف SEO',         en: 'SEO Employee'    },
};

export function getRoleNameLabel(name: string, isAr: boolean): string {
  return ROLE_NAME_LABEL[name]?.[isAr ? 'ar' : 'en'] ?? name;
}
