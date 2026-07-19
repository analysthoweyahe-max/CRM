export interface ApiJobTitle {
  id:   number;
  name: string;
  department_id?: number | string | null;
  departmentId?:  number | string | null;
  department?:    { id: number | string; name?: string } | null;
  image?:         string | null;
}

/** Resolve a job title's department id from the common API shapes. */
export function jobTitleDepartmentId(jobTitle: ApiJobTitle | null | undefined): string {
  if (!jobTitle) return '';
  const raw = jobTitle.department_id ?? jobTitle.departmentId ?? jobTitle.department?.id;
  return raw != null && raw !== '' ? String(raw) : '';
}

export interface JobTitleListResponse {
  status:  string;
  message: string;
  data:    ApiJobTitle[];
}

export interface JobTitleSingleResponse {
  status:  string;
  message: string;
  data:    ApiJobTitle;
}

export interface CreateJobTitlePayload {
  name:          string;
  department_id: string | number;
  image:         File;
}

export interface UpdateJobTitlePayload {
  name:          string;
  department_id: string | number;
  image?:        File;
}

export interface DeleteJobTitleResponse {
  status:  string;
  message: string;
}

export type UpdateJobTitleResponse = JobTitleSingleResponse;
