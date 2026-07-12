import type { PermissionAction } from '../../roles/types/adminRole.types';
import type { ApiEmployee } from '@/modules/hr/employees/types/employee.types';
import {
  mapEmploymentType,
  resolveDisplayText,
  resolveIdentifier,
  formatEmployeeDepartments,
  employeeDepartmentsList,
} from '@/modules/hr/employees/types/employee.types';
import { getAvatarColor, getInitial } from '@/shared/utils/avatar.utils';

export type AdminEmployeeStatus = 'active' | 'inactive' | 'pending';

const STATUS_LABEL: Record<AdminEmployeeStatus, { ar: string; en: string }> = {
  active:   { ar: 'نشط',   en: 'Active'   },
  inactive: { ar: 'معطل',  en: 'Inactive' },
  pending:  { ar: 'معلق',  en: 'Pending'  },
};

const ROLE_LABEL: Record<string, { ar: string; en: string }> = {
  'hr-manager':      { ar: 'مدير الموارد البشرية', en: 'HR Manager'         },
  'pm-employee':     { ar: 'موظف مشاريع',         en: 'PM Employee'       },
  'project-manager': { ar: 'مدير المشاريع',       en: 'Project Manager'   },
  'seo-employee':    { ar: 'موظف SEO',            en: 'SEO Employee'      },
  'seo-leader':      { ar: 'قائد SEO',             en: 'SEO Leader'        },
  'seo-manager':     { ar: 'مدير SEO',            en: 'SEO Manager'       },
  'super-admin':     { ar: 'مشرف عام',            en: 'Super Admin'       },
  admin:             { ar: 'مدير عام',            en: 'Admin'             },
};

export function getRoleLabel(role: string, isAr: boolean): string {
  return ROLE_LABEL[role]?.[isAr ? 'ar' : 'en'] ?? role;
}

export interface AdminEmployee {
  id:             string;
  employeeNumber: string;
  userId:         string;
  name:           string;
  email:          string;
  avatarInitial:  string;
  avatarColor:    string;
  /** Joined display string of all departments. */
  department:     string;
  /** Individual department labels for filtering. */
  departments:    string[];
  jobTitle:       string;
  roles:          string[];
  role:           string;
  status:         AdminEmployeeStatus;
  statusLabelAr:  string;
  statusLabelEn:  string;
  phone?:         string;
  /** Effective permissions for UI gating. */
  permissions:    string[];
  /** Per-role permission breakdown, when provided by the backend. */
  roleDetails:    { name: string; permissions: string[] }[];
  /** Human-readable department section (e.g. "SEO"). */
  sectionLabel?:  string;
  /** true = Super Admin set the role manually; department changes won't re-sync it. */
  roleManuallyAssigned: boolean;
}

export interface AdminEmployeeActivity {
  id:      string;
  titleAr: string;
  titleEn: string;
  timeAr:  string;
  timeEn:  string;
}

export interface AdminEmployeeStats {
  projects:        number;
  tasksAssigned:   number;
  totalHours:      number;
  completionRate:  number;
}

export interface AdminEmployeeDetail extends AdminEmployee {
  phone:              string;
  managerName:        string;
  joiningDateAr:      string;
  joiningDateEn:      string;
  employmentTypeAr:   string;
  employmentTypeEn:   string;
  accountCreatedAr:   string;
  accountCreatedEn:   string;
  stats:              AdminEmployeeStats;
  activity:           AdminEmployeeActivity[];
  customPermissions:  Record<string, PermissionAction[]>;
}

// No stats/activity-log/custom-permissions endpoint exists yet — shown empty until the backend adds one.
const EMPTY_STATS: AdminEmployeeStats = { projects: 0, tasksAssigned: 0, totalHours: 0, completionRate: 0 };

function toStatus(emp: ApiEmployee): AdminEmployeeStatus {
  return emp.status === 'inactive' ? 'inactive' : emp.status === 'pending' ? 'pending' : 'active';
}

export function toAdminEmployee(emp: ApiEmployee): AdminEmployee {
  const status = toStatus(emp);
  const roles  = (emp.roles ?? [])
    .map((role) => (typeof role === 'string' ? role : resolveDisplayText(role, true)))
    .filter(Boolean);
  const userId = resolveIdentifier(
    emp.userId ?? emp.user_id ?? emp.employeeNumber ?? emp.id,
    String(emp.employeeNumber ?? emp.id ?? '—'),
  );
  const departments = employeeDepartmentsList(emp)
    .map((d) => resolveDisplayText(d, true))
    .filter(Boolean);

  return {
    id:             emp.id,
    employeeNumber: emp.employeeNumber ?? emp.id,
    userId,
    name:           emp.name,
    email:          emp.email,
    avatarInitial:  getInitial(emp.name),
    avatarColor:    getAvatarColor(emp.name),
    department:     formatEmployeeDepartments(emp, true) || '—',
    departments,
    jobTitle:       resolveDisplayText(emp.jobTitle, true) || '—',
    roles,
    role:           roles.length ? roles.map(r => getRoleLabel(r, true)).join('، ') : '—',
    status,
    statusLabelAr:  STATUS_LABEL[status].ar,
    statusLabelEn:  STATUS_LABEL[status].en,
    permissions:    emp.permissions ?? [],
    roleDetails:    emp.roleDetails ?? [],
    sectionLabel:   emp.sectionLabel ?? undefined,
    roleManuallyAssigned: emp.roleManuallyAssigned ?? false,
  };
}

export function toAdminEmployeeDetail(emp: ApiEmployee): AdminEmployeeDetail {
  return {
    ...toAdminEmployee(emp),
    phone:             emp.phone ?? '—',
    managerName:       emp.manager?.name ?? '—',
    joiningDateAr:     emp.joiningDate ?? '—',
    joiningDateEn:     emp.joiningDate ?? '—',
    employmentTypeAr:  emp.employmentTypeLabel ?? mapEmploymentType(emp.employmentType, true),
    employmentTypeEn:  mapEmploymentType(emp.employmentType, false),
    accountCreatedAr:  emp.createdAt ?? '—',
    accountCreatedEn:  emp.createdAt ?? '—',
    stats:             EMPTY_STATS,
    activity:          [],
    customPermissions: {},
  };
}
