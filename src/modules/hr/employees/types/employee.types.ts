export type EmployeeStatus  = 'active' | 'inactive' | 'pending';
export type EmploymentType  = 'full_time' | 'part_time' | 'contract' | 'remote' | 'internship';

// ── Lookup shape used inside employee objects ─────────────────────────────────
export interface ApiLookup {
  id:            number | string;
  name:          string;
  nameAr?:       string | null;
  name_ar?:      string | null;
  isActive?:     boolean;
  departmentId?: number | string | null;
  department_id?: number | string | null;
}

// ── Employee as returned by the API (camelCase) ───────────────────────────────
export interface ApiEmployee {
  id:                  string;
  employeeNumber?:     string;
  userId?:             string;
  user_id?:            string;
  name:                string;
  email:               string;
  phone:               string | null;
  status:              EmployeeStatus;
  pendingActivation?:  boolean;
  /** Primary department (first in departmentIds). */
  department:          ApiLookup | null;
  /** All assigned departments. */
  departments?:        ApiLookup[];
  section?:            string | null;
  sectionLabel?:       string | null;
  jobTitle:            ApiLookup | null;
  joiningDate:         string | null;
  employmentType?:     EmploymentType | null;
  employmentTypeLabel?: string | null;
  salary?:             number | null;
  /** ISO currency code next to salary (EGP | USD | EUR | SAR | AED | GBP | QAR | KWD). */
  currency?:           string | null;
  workingHours?:       number | null;
  onboardingStep?:     number;
  manager?:            ApiLookup | null;
  roles?:              string[];
  /** Per-role permission breakdown, when provided by the backend. */
  roleDetails?:        { name: string; permissions: string[] }[];
  /** Effective permissions for UI gating. */
  permissions?:        string[];
  /** true = Super Admin set the role manually; department changes won't re-sync it. */
  roleManuallyAssigned?: boolean;
  createdAt?:          string;
  updatedAt?:          string;
}

// ── List response ─────────────────────────────────────────────────────────────
export interface EmployeeListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiEmployee[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

// ── Single response ───────────────────────────────────────────────────────────
export interface EmployeeSingleResponse {
  status:  string;
  message: string;
  data:    ApiEmployee;
}

// ── Lookup list response ──────────────────────────────────────────────────────
export interface LookupListResponse {
  status:  string;
  message: string;
  data:    ApiLookup[];
}

// ── Employment type lookup (value/label shape, distinct from ApiLookup) ────────
export interface EmploymentTypeLookup {
  value: string;
  label: string;
}

export interface EmploymentTypeLookupResponse {
  status:  string;
  message: string;
  data:    EmploymentTypeLookup[];
}

// ── Request payloads ──────────────────────────────────────────────────────────
export interface CreateEmployeePayload {
  name:             string;
  email:            string;
  phone:            string;
  /** Preferred — at least one required. First id = primary. */
  department_ids:   number[];
  /** Legacy single-dept form (backend converts to department_ids). */
  department_id?:   number | string;
  job_title_id:     number | string;
  joining_date:     string;
  manager_id?:      string | null;
}

export interface UpdateEmployeePayload {
  name?:            string;
  email?:           string;
  phone?:           string;
  /** Preferred multi-dept update. First id = primary. */
  department_ids?:  number[];
  /** Legacy single-dept form. */
  department_id?:   number;
  job_title_id?:    number;
  manager_id?:      string | null;
  joining_date?:    string;
  status?:          EmployeeStatus;
  employment_type?: EmploymentType;
  salary?:          number;
  currency?:        string;
  working_hours?:   number;
}

export interface UpdateWorkSchedulePayload {
  working_hours: number;
}

export interface UpdateEmployeePasswordPayload {
  password:              string;
  password_confirmation: string;
}

export type AssignEmployeeRolePayload =
  | { role: string; permissions?: string[] }
  | { sync_role_from_department: true };

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-red-400',    'bg-blue-400',   'bg-purple-400', 'bg-orange-400',
  'bg-green-500',  'bg-teal-400',   'bg-yellow-500', 'bg-pink-400',
  'bg-indigo-400', 'bg-rose-400',   'bg-cyan-500',   'bg-lime-500',
  'bg-amber-500',  'bg-violet-500',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function getLookupLabel(lookup: ApiLookup | null | undefined, isAr: boolean): string {
  if (!lookup) return '–';
  return isAr ? (lookup.nameAr || lookup.name_ar || lookup.name) : lookup.name;
}

export function employeeLookupId(lookup?: ApiLookup | null): string {
  if (lookup?.id == null) return '';
  return String(lookup.id);
}

/** Prefill department multi-select from API (departments[] with department fallback). */
export function employeeDepartmentIds(raw: {
  departments?: ApiLookup[] | null;
  department?:  ApiLookup | null;
}): string[] {
  if (raw.departments?.length) {
    return raw.departments
      .map((d) => employeeLookupId(d))
      .filter(Boolean);
  }
  const single = employeeLookupId(raw.department);
  return single ? [single] : [];
}

/** All departments for display — departments[] with department fallback. */
export function employeeDepartmentsList(raw: {
  departments?: ApiLookup[] | null;
  department?:  ApiLookup | null;
}): ApiLookup[] {
  if (raw.departments?.length) return raw.departments;
  return raw.department ? [raw.department] : [];
}

export function formatEmployeeDepartments(
  raw: { departments?: ApiLookup[] | null; department?: ApiLookup | null },
  isAr: boolean,
): string {
  const list = employeeDepartmentsList(raw);
  if (!list.length) return '—';
  return list
    .map((d) => resolveDisplayText(d, isAr))
    .filter(Boolean)
    .join(isAr ? '، ' : ', ');
}

export function toDepartmentIds(ids: string[]): number[] {
  return ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
}

export function titleDepartmentId(t: {
  departmentId?: unknown;
  department_id?: unknown;
}): string {
  const raw = t.departmentId ?? t.department_id;
  return raw == null || raw === '' ? '' : String(raw);
}

/** Coerce API lookup / string / object fields to a display string. */
export function resolveDisplayText(value: unknown, isAr = false): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value !== 'object') return '';

  const obj = value as Record<string, unknown>;
  const nameAr = obj.nameAr ?? obj.name_ar;
  const name   = obj.name ?? obj.label ?? obj.title;

  if (isAr && typeof nameAr === 'string' && nameAr.trim()) return nameAr;
  if (typeof name === 'string' && name.trim()) return name;
  return '';
}

/** Coerce API identifier fields (user id, employee number, etc.) to a string. */
export function resolveIdentifier(value: unknown, fallback = '—'): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of ['id', 'user_id', 'userId', 'employee_id', 'employee_number', 'employeeNumber']) {
      const v = obj[key];
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (typeof v === 'number' && !Number.isNaN(v)) return String(v);
    }
  }

  return fallback;
}

export function mapEmploymentType(type: EmploymentType | null | undefined, isAr: boolean): string {
  const map: Record<EmploymentType, [string, string]> = {
    full_time:  ['دوام كامل',  'Full Time'],
    part_time:  ['دوام جزئي',  'Part Time'],
    contract:   ['عقد',        'Contract'],
    remote:     ['عن بُعد',    'Remote'],
    internship: ['تدريب',      'Internship'],
  };
  if (!type) return isAr ? 'غير محدد' : 'Not set';
  return isAr ? map[type][0] : map[type][1];
}
