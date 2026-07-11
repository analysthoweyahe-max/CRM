import type { ApiLookup } from '@/modules/hr/employees/types/employee.types';

export type CreateProjectModule = 'pm' | 'seo';

/** Client-side module tag — API always returns `category: null`; set after fetch. */
export type ProjectTypeCategory = CreateProjectModule;

export type ProjectStatus =
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'completed';

export interface DepartmentLookup {
  id:     number;
  name:   string;
  nameAr?: string | null;
}

export interface ProjectType {
  id:             number;
  name:           string;
  nameAr:         string | null;
  slug:           string;
  label:          string;
  /** Always "pm" | "seo" in UI state — never null. */
  category:       ProjectTypeCategory;
  section?:       ProjectTypeCategory | null;
  sectionLabel?:  string | null;
  departmentId:   number | null;
  departmentName?: string;
  isActive:       boolean;
  sortOrder?:     number;
}

export interface EmployeeLookup {
  id:           string;
  name:         string;
  email:        string;
  departmentId: number;
  department?:  string | ApiLookup | null;
  jobTitle?:    string | ApiLookup | null;
}

export interface ManagerLookup {
  id:    string;
  name:  string;
  email: string;
}

export interface StatusLookup {
  value: string;
  label: string;
}

export interface CreatePmProjectPayload {
  name:                    string;
  description?:            string | null;
  projectTypeId:           number;
  githubLink?:             string | null;
  driveLink?:              string | null;
  contractDurationMonths?: number | null;
  managerIds?:             string[];
  employeeIds?:            string[];
  status?:                 ProjectStatus | string;
  isDraft?:                boolean;
  startDate?:              string | null;
  deadline?:               string | null;
  templateId?:             string | null;
}

export interface CreateSeoProjectPayload {
  name:                    string;
  description?:            string | null;
  projectTypeId:           number;
  targetDomain?:           string | null;
  githubLink?:             string | null;
  driveLink?:              string | null;
  contractDurationMonths?: number | null;
  managerIds?:             string[];
  employeeIds?:            string[];
  status?:                 ProjectStatus | string;
  isDraft?:                boolean;
  startDate?:              string | null;
  expectedEndDate?:        string | null;
}

export interface CreateProjectTypePayload {
  name:          string;
  nameAr?:       string | null;
  slug?:         string;
  departmentId?: number | null;
  isActive?:     boolean;
  sortOrder?:    number;
}

export type CreateProjectFieldErrors = {
  name?:                   string;
  description?:            string;
  projectTypeId?:          string;
  targetDomain?:           string;
  githubLink?:             string;
  driveLink?:              string;
  contractDurationMonths?: string;
  managerIds?:             string;
  employeeIds?:            string;
  startDate?:              string;
  endDate?:                string;
  status?:                 string;
};
