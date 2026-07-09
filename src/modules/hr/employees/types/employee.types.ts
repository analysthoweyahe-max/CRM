export type EmployeeStatus  = 'active' | 'inactive' | 'pending';
export type EmploymentType  = 'full_time' | 'part_time' | 'contract' | 'remote' | 'internship';

// ── Lookup shape used inside employee objects ─────────────────────────────────
export interface ApiLookup {
  id:          number | string;   // API returns integer IDs
  name:        string;
  nameAr?:     string | null;
  isActive?:   boolean;
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
  department:          ApiLookup | null;
  jobTitle:            ApiLookup | null;
  joiningDate:         string | null;
  employmentType?:     EmploymentType | null;
  employmentTypeLabel?: string | null;
  salary?:             number | null;
  workingHours?:       number | null;
  onboardingStep?:     number;
  manager?:            ApiLookup | null;
  roles?:              string[];
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
  name:           string;
  email:          string;
  phone:          string;
  department_id:  string;   // UUID — backend lookup returns UUIDs
  job_title_id:   string;   // UUID — backend lookup returns UUIDs
  joining_date:   string;
  manager_id?:    string | null;
}

export interface UpdateEmployeePayload {
  name?:            string;
  email?:           string;
  phone?:           string;
  department_id?:   number;
  job_title_id?:    number;
  manager_id?:      string | null;
  joining_date?:    string;
  status?:          EmployeeStatus;
  employment_type?: EmploymentType;
  salary?:          number;
  working_hours?:   number;
}

export interface UpdateWorkSchedulePayload {
  working_hours: number;
}

export interface UpdateEmployeePasswordPayload {
  password:              string;
  password_confirmation: string;
}

export interface AssignEmployeeRolePayload {
  role:        string;
  permissions: string[];
}

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
  return isAr ? (lookup.nameAr || lookup.name) : lookup.name;
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
