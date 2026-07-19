import type { ApiLookup } from '@/modules/hr/employees/types/employee.types';
import { resolveDisplayText } from '@/modules/hr/employees/types/employee.types';

/** Fallback select options — `id` is always the English slug sent to the API. */
export const MANAGER_ROLE_OPTIONS = [
  { id: 'hr-manager',      labelAr: 'مدير الموارد البشرية', labelEn: 'HR Manager'       },
  { id: 'project-manager', labelAr: 'مدير المشاريع',        labelEn: 'Project Manager'  },
  { id: 'seo-manager',     labelAr: 'مدير SEO',             labelEn: 'SEO Manager'      },
] as const;

/** Roles HR managers may assign when creating/editing a manager (no custom permissions). */
export const HR_CREATABLE_MANAGER_ROLES = ['seo-manager', 'project-manager'] as const;

export type ManagerRole = 'hr-manager' | 'seo-manager' | 'project-manager';

export type ManagerStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'banned';

export const MANAGER_STATUS_OPTIONS: Array<{
  id: ManagerStatus;
  labelAr: string;
  labelEn: string;
  variant: 'success' | 'warning' | 'error' | 'gray';
}> = [
  { id: 'pending',   labelAr: 'بانتظار الدعوة', labelEn: 'Pending invitation', variant: 'warning' },
  { id: 'active',    labelAr: 'نشط',            labelEn: 'Active',             variant: 'success' },
  { id: 'rejected',  labelAr: 'مرفوض',          labelEn: 'Rejected',           variant: 'error'   },
  { id: 'suspended', labelAr: 'موقوف مؤقتاً',   labelEn: 'Suspended',          variant: 'warning' },
  { id: 'banned',    labelAr: 'محظور',          labelEn: 'Banned',               variant: 'error'   },
];

export function getManagerStatusLabel(status: ManagerStatus | string, isAr: boolean): string {
  const opt = MANAGER_STATUS_OPTIONS.find(o => o.id === status);
  if (opt) return isAr ? opt.labelAr : opt.labelEn;
  return status;
}

export function managerLookupId(lookup?: ApiLookup | null): string {
  if (lookup?.id == null) return '';
  return String(lookup.id);
}

/** Prefill department multi-select from API (departments[] / department / department_ids). */
export function managerDepartmentIds(raw: {
  departments?:    ApiLookup[] | null;
  department?:     ApiLookup | null;
  department_ids?: Array<number | string> | null;
}): string[] {
  if (raw.departments?.length) {
    return raw.departments
      .map((d) => managerLookupId(d))
      .filter(Boolean);
  }
  const single = managerLookupId(raw.department);
  if (single) return [single];
  if (raw.department_ids?.length) {
    return raw.department_ids.map(String).filter(Boolean);
  }
  return [];
}

export function formatManagerDepartments(
  raw: { departments?: ApiLookup[] | null; department?: ApiLookup | null },
  isAr: boolean,
): string {
  const list = raw.departments?.length
    ? raw.departments
    : (raw.department ? [raw.department] : []);
  if (!list.length) return '—';
  return list
    .map((d) => resolveDisplayText(d, isAr))
    .filter(Boolean)
    .join(isAr ? '، ' : ', ');
}

export interface CreateAdminPayload {
  name:             string;
  email:            string;
  role:             string;
  department_ids?:  number[];
  job_title_id?:    number | null;
  permissions?:     string[];
}

export interface UpdateAdminPayload {
  name?:            string;
  email?:           string;
  phone?:           string | null;
  status?:          ManagerStatus;
  role?:            ManagerRole | string;
  department_ids?:  number[];
  job_title_id?:    number | null;
  permissions?:     string[];
}

export type AssignAdminRolePayload = UpdateAdminPayload;

export interface CreateAdminResponse {
  status:  string;
  message: string;
  data?:   ApiAdminManager;
}

export interface UpdateAdminResponse {
  status:  string;
  message: string;
  data?:   ApiAdminManager;
}

export interface ApiAdminManager {
  id:            string;
  name:          string;
  email:         string;
  roles:         string[];
  permissions?:  string[];
  roleDetails?:  Array<{ name: string; permissions: string[] }>;
  avatar_url?:   string;
  phone?:        string | null;
  /** Primary / first department — display fallback only. */
  department?:   ApiLookup | null;
  /** All assigned departments. */
  departments?:  ApiLookup[];
  /** Bare ids when nested `departments` is omitted. */
  department_ids?: Array<number | string> | null;
  jobTitle?:     ApiLookup | null;
  /** Snake_case aliases some admin payloads still return. */
  job_title?:    ApiLookup | null;
  job_title_id?: number | string | null;
  status?:       string;
  emailVerified?: boolean;
  lastLoginAt?:  string | null;
  isSuperAdmin?: boolean;
  createdAt?:    string;
  updatedAt?:    string;
}

export interface AdminManagerListParams {
  page?:              number;
  per_page?:          number;
  search?:            string;
  sort?:              string;
  'filter[status]'?:  string;
  'filter[roles.name]'?: string;
}

export interface AdminManagerListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiAdminManager[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface AdminManagerDetailResponse {
  status:  string;
  message: string;
  data:    ApiAdminManager;
}

export interface ManagerFormValues {
  name:          string;
  email:         string;
  phone:         string;
  departmentIds: string[];
  jobTitleId:    string;
  status:        ManagerStatus;
  role:          string;
  permissions:   string[];
}
