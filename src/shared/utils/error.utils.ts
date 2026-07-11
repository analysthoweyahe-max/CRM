import type { AxiosError } from 'axios';

const FIELD_ALIASES: Record<string, string> = {
  github_link:              'githubLink',
  drive_link:               'driveLink',
  contract_duration_months: 'contractDurationMonths',
  manager_ids:              'managerIds',
  employee_ids:             'employeeIds',
  department_ids:           'departmentIds',
  department_id:            'departmentIds',
  job_title_id:             'jobTitleId',
  project_type_id:          'projectTypeId',
  target_domain:            'targetDomain',
  expected_end_date:        'endDate',
  start_date:               'startDate',
  is_draft:                 'isDraft',
  password_confirmation:    'confirmPassword',
  bonus_type_id:            'bonus_type_id',
  adjustment_type:          'bonus_type_id',
  deduction_type_id:        'deduction_type_id',
  deduction_type:           'deduction_type_id',
};

export function extractApiFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
  const fieldErrors = axiosError?.response?.data?.errors;
  if (!fieldErrors) return {};

  const result: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs?.[0]) result[FIELD_ALIASES[key] ?? key] = msgs[0];
  }
  return result;
}

export function extractApiStatus(error: unknown): number | undefined {
  const axiosError = error as AxiosError;
  return axiosError?.response?.status;
}

export function hasTokenValidationError(error: unknown): boolean {
  const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
  const tokenErrors = axiosError?.response?.data?.errors?.token;
  return Array.isArray(tokenErrors) && tokenErrors.length > 0;
}

export function extractApiError(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const data = axiosError?.response?.data;

  const fieldErrors = data?.errors;
  if (fieldErrors) {
    const firstField = Object.values(fieldErrors).find((msgs) => Array.isArray(msgs) && msgs.length > 0);
    if (firstField?.[0]) return firstField[0];
  }

  return data?.message ?? 'An unexpected error occurred.';
}
