import type {
  CreateProjectModule,
  ManagerLookup,
  ProjectType,
  ProjectTypeCategory,
} from '../types/createProject.types';

interface RawProjectType {
  id?:             number | string | null;
  value?:          number | string | null;
  name?:           string | null;
  name_ar?:        string | null;
  nameAr?:         string | null;
  label?:          string | null;
  labelAr?:        string | null;
  slug?:           string | null;
  category?:       string | null;
  section?:        string | null;
  sectionLabel?:   string | null;
  section_label?:  string | null;
  department_id?:  number | null;
  departmentId?:   number | null;
  department?:     { id?: number; name?: string; nameAr?: string | null; name_ar?: string | null } | null;
  is_active?:      boolean | null;
  isActive?:       boolean | null;
  sort_order?:     number | null;
  sortOrder?:      number | null;
}

/** API returns `category: null` on purpose — always coerce from module context. */
export function normalizeProjectTypeCategory(
  raw: string | null | undefined,
  fallback: ProjectTypeCategory,
): ProjectTypeCategory {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'pm' || v === 'project-manager') return 'pm';
  if (v === 'seo' || v === 'seo-leader') return 'seo';
  return fallback;
}

// Lookups may return legacy {value,label} pairs or full CRUD records with
// snake_case keys — normalize both so dropdowns never stay empty on shape mismatch.
export function normalizeProjectType(
  raw: RawProjectType,
  fallbackCategory: ProjectTypeCategory,
): ProjectType | null {
  const id = Number(raw.id ?? raw.value);
  if (!id || Number.isNaN(id)) return null;

  const name    = String(raw.name ?? raw.label ?? '').trim();
  const label   = String(raw.label ?? raw.name ?? name).trim();
  const nameAr  = raw.nameAr ?? raw.name_ar ?? null;
  const deptRaw = raw.departmentId ?? raw.department_id ?? raw.department?.id;
  const deptNum = deptRaw == null ? null : Number(deptRaw);
  const isActive = raw.isActive ?? raw.is_active ?? true;
  const sortRaw  = raw.sortOrder ?? raw.sort_order;
  const category = normalizeProjectTypeCategory(raw.category ?? raw.section, fallbackCategory);

  return {
    id,
    name:    name || label,
    nameAr,
    slug:    raw.slug ?? String(id),
    label:   label || name,
    category,
    section: raw.section === 'pm' || raw.section === 'seo' ? raw.section : category,
    sectionLabel: raw.sectionLabel ?? raw.section_label ?? null,
    departmentId: deptNum != null && !Number.isNaN(deptNum) ? deptNum : null,
    departmentName: raw.department?.name,
    isActive: isActive !== false,
    sortOrder: sortRaw == null ? undefined : Number(sortRaw),
  };
}

export function normalizeProjectTypes(
  raw: unknown,
  fallbackCategory: ProjectTypeCategory,
): ProjectType[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map(item => normalizeProjectType(item as RawProjectType, fallbackCategory))
    .filter((t): t is ProjectType => t != null);
}

export function filterTypesByDepartment(types: ProjectType[], departmentId: number): ProjectType[] {
  return types.filter(t => t.departmentId == null || t.departmentId === departmentId);
}

export function projectTypeLabel(type: ProjectType, isAr: boolean): string {
  if (isAr && type.nameAr) return type.nameAr;
  return type.label || type.name;
}

export function projectTypeToComboboxId(type: ProjectType): string {
  return String(type.id);
}

export function activeProjectTypes(types: ProjectType[]): ProjectType[] {
  return types.filter(t => t.isActive !== false);
}

export function withModuleCategory(
  types: ProjectType[],
  module: CreateProjectModule,
): ProjectType[] {
  return types.map(t => ({ ...t, category: module }));
}

interface RawManager {
  id?:     string | number | null;
  value?:  string | number | null;
  name?:   string | null;
  label?:  string | null;
  email?:  string | null;
  detail?: string | null;
}

// Manager lookups may return {value,label} pairs or full admin records.
export function normalizeManager(raw: RawManager): ManagerLookup | null {
  const id = String(raw.id ?? raw.value ?? '').trim();
  if (!id) return null;

  const name = String(raw.name ?? raw.label ?? '').trim();
  if (!name) return null;

  return {
    id,
    name,
    email: String(raw.email ?? raw.detail ?? '').trim(),
  };
}

export function normalizeManagers(raw: unknown): ManagerLookup[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map(item => normalizeManager(item as RawManager))
    .filter((m): m is ManagerLookup => m != null);
}
