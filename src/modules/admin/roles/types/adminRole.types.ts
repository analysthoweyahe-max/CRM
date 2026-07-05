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
  guardName:   string;
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

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'admin', labelAr: 'الإدارة', labelEn: 'Administration',
    slugs: [
      { slug: 'create-admin', labelAr: 'إنشاء مدير', labelEn: 'Create Admin' },
      { slug: 'assign-role',  labelAr: 'تعيين دور',  labelEn: 'Assign Role'  },
    ],
  },
  {
    key: 'roles', labelAr: 'الأدوار والصلاحيات', labelEn: 'Roles & Permissions',
    slugs: [
      { slug: 'view-roles',        labelAr: 'عرض الأدوار',        labelEn: 'View Roles'        },
      { slug: 'create-role',       labelAr: 'إنشاء دور',          labelEn: 'Create Role'       },
      { slug: 'edit-role',         labelAr: 'تعديل دور',          labelEn: 'Edit Role'         },
      { slug: 'delete-role',       labelAr: 'حذف دور',            labelEn: 'Delete Role'       },
      { slug: 'view-permissions',  labelAr: 'عرض الصلاحيات',      labelEn: 'View Permissions'  },
      { slug: 'create-permission', labelAr: 'إنشاء صلاحية',       labelEn: 'Create Permission' },
      { slug: 'edit-permission',   labelAr: 'تعديل صلاحية',       labelEn: 'Edit Permission'   },
      { slug: 'delete-permission', labelAr: 'حذف صلاحية',         labelEn: 'Delete Permission' },
    ],
  },
  {
    key: 'employees', labelAr: 'الموظفون', labelEn: 'Employees',
    slugs: [
      { slug: 'view-employees',  labelAr: 'عرض',   labelEn: 'View'   },
      { slug: 'create-employee', labelAr: 'إضافة', labelEn: 'Create' },
      { slug: 'edit-employee',   labelAr: 'تعديل', labelEn: 'Edit'   },
      { slug: 'delete-employee', labelAr: 'حذف',   labelEn: 'Delete' },
    ],
  },
  {
    key: 'attendance', labelAr: 'الحضور', labelEn: 'Attendance',
    slugs: [
      { slug: 'view-attendance', labelAr: 'عرض', labelEn: 'View' },
    ],
  },
  {
    key: 'leave', labelAr: 'الإجازات', labelEn: 'Leave',
    slugs: [
      { slug: 'view-leave',    labelAr: 'عرض',    labelEn: 'View'    },
      { slug: 'approve-leave', labelAr: 'اعتماد', labelEn: 'Approve' },
    ],
  },
  {
    key: 'payroll', labelAr: 'الرواتب', labelEn: 'Payroll',
    slugs: [
      { slug: 'view-payroll',   labelAr: 'عرض',   labelEn: 'View'   },
      { slug: 'manage-payroll', labelAr: 'إدارة', labelEn: 'Manage' },
    ],
  },
  {
    key: 'seo-projects', labelAr: 'مشاريع SEO', labelEn: 'SEO Projects',
    slugs: [
      { slug: 'view-seo-projects',   labelAr: 'عرض',   labelEn: 'View'   },
      { slug: 'create-seo-project',  labelAr: 'إضافة', labelEn: 'Create' },
      { slug: 'edit-seo-project',    labelAr: 'تعديل', labelEn: 'Edit'   },
      { slug: 'delete-seo-project',  labelAr: 'حذف',   labelEn: 'Delete' },
    ],
  },
  {
    key: 'pm-projects', labelAr: 'مشاريع إدارة المشاريع', labelEn: 'PM Projects',
    slugs: [
      { slug: 'view-pm-projects',  labelAr: 'عرض',   labelEn: 'View'   },
      { slug: 'create-pm-project', labelAr: 'إضافة', labelEn: 'Create' },
      { slug: 'edit-pm-project',   labelAr: 'تعديل', labelEn: 'Edit'   },
      { slug: 'delete-pm-project', labelAr: 'حذف',   labelEn: 'Delete' },
    ],
  },
];

const ROLE_NAME_LABEL: Record<string, { ar: string; en: string }> = {
  'super-admin':     { ar: 'مشرف عام',         en: 'Super Admin'     },
  'hr-manager':      { ar: 'مدير موارد بشرية', en: 'HR Manager'      },
  'project-manager': { ar: 'مدير مشاريع',      en: 'Project Manager' },
  'seo-manager':     { ar: 'مدير SEO',         en: 'SEO Manager'     },
};

export function getRoleNameLabel(name: string, isAr: boolean): string {
  return ROLE_NAME_LABEL[name]?.[isAr ? 'ar' : 'en'] ?? name;
}
