import type { ApiLookup } from '@/modules/hr/employees/types/employee.types';

export type CreateProjectModule = 'pm' | 'seo';

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
  departmentId:   number;
  departmentName?: string;
  isActive:       boolean;
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

export interface CreatePmProjectPayload {
  name:                    string;
  description?:            string | null;
  projectTypeId:           number;
  githubLink?:             string | null;
  driveLink?:              string | null;
  contractDurationMonths?: number | null;
  managerIds?:             string[];
  employeeIds?:            string[];
  status?:                 string;
  isDraft?:                boolean;
  start_date?:             string | null;
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
  isDraft?:                boolean;
  start_date?:             string | null;
  expected_end_date?:      string | null;
}

export interface CreateProjectTypePayload {
  name:          string;
  name_ar?:      string | null;
  department_id: number;
  is_active?:    boolean;
  sort_order?:   number;
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
};
