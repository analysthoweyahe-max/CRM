import type { PermissionAction } from '../../roles/types/adminRole.types';
import type { ApiEmployee } from '@/modules/hr/employees/types/employee.types';
import { mapEmploymentType } from '@/modules/hr/employees/types/employee.types';
import { getAvatarColor, getInitial } from '@/shared/utils/avatar.utils';

export type AdminEmployeeStatus = 'active' | 'inactive' | 'pending';

const STATUS_LABEL: Record<AdminEmployeeStatus, { ar: string; en: string }> = {
  active:   { ar: 'نشط',   en: 'Active'   },
  inactive: { ar: 'معطل',  en: 'Inactive' },
  pending:  { ar: 'معلق',  en: 'Pending'  },
};

const ROLE_LABEL: Record<string, { ar: string; en: string }> = {
  'hr-manager':      { ar: 'مدير موارد بشرية',   en: 'HR Manager'         },
  'pm-employee':     { ar: 'موظف مشاريع',         en: 'PM Employee'       },
  'project-manager': { ar: 'مدير مشاريع',         en: 'Project Manager'   },
  'seo-employee':    { ar: 'موظف SEO',            en: 'SEO Employee'      },
  'seo-leader':      { ar: 'قائد SEO',             en: 'SEO Leader'        },
  'seo-manager':     { ar: 'مدير SEO',            en: 'SEO Manager'       },
  admin:             { ar: 'مدير عام',            en: 'Admin'             },
};

export function getRoleLabel(role: string, isAr: boolean): string {
  return ROLE_LABEL[role]?.[isAr ? 'ar' : 'en'] ?? role;
}

export interface AdminEmployee {
  id:             string;
  employeeNumber: string;
  name:           string;
  email:          string;
  avatarInitial:  string;
  avatarColor:    string;
  department:     string;
  jobTitle:       string;
  roles:          string[];
  role:           string;
  status:         AdminEmployeeStatus;
  statusLabelAr:  string;
  statusLabelEn:  string;
  phone?:         string;
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
  const roles  = emp.roles ?? [];
  return {
    id:             emp.id,
    employeeNumber: emp.employeeNumber ?? emp.id,
    name:           emp.name,
    email:          emp.email,
    avatarInitial:  getInitial(emp.name),
    avatarColor:    getAvatarColor(emp.name),
    department:     emp.department?.name ?? '—',
    jobTitle:       emp.jobTitle?.name ?? '—',
    roles,
    role:           roles.length ? roles.map(r => getRoleLabel(r, true)).join('، ') : '—',
    status,
    statusLabelAr:  STATUS_LABEL[status].ar,
    statusLabelEn:  STATUS_LABEL[status].en,
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
