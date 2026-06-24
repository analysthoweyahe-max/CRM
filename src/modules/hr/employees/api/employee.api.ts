import { http } from '@/shared/services/http.service';
import type {
  EmployeeListResponse,
  EmployeeSingleResponse,
  LookupListResponse,
  CreateEmployeePayload,
  EmploymentType,
} from '../types/employee.types';

export const employeeApi = {
  list(params: { page?: number; per_page?: number; search?: string }) {
    return http.get<EmployeeListResponse>('/v1/employees', { params });
  },

  get(id: string) {
    return http.get<EmployeeSingleResponse>(`/v1/employees/${id}`);
  },

  create(payload: CreateEmployeePayload) {
    return http.post<EmployeeSingleResponse>('/v1/employees', payload);
  },

  updateEmploymentType(id: string, payload: { employment_type: EmploymentType }) {
    return http.post<EmployeeSingleResponse>(`/v1/employees/${id}/employment-type`, payload);
  },

  updateSalary(id: string, payload: { salary: number }) {
    return http.post<EmployeeSingleResponse>(`/v1/employees/${id}/salary`, payload);
  },

  updateWorkSchedule(id: string, payload: { shift_start: string; shift_end: string }) {
    return http.post<EmployeeSingleResponse>(`/v1/employees/${id}/work-schedule`, payload);
  },

  submit(id: string) {
    return http.post<EmployeeSingleResponse>(`/v1/employees/${id}/submit`, {});
  },

  lookupDepartments() {
    return http.get<LookupListResponse>('/v1/employees/lookups/departments');
  },

  lookupJobTitles(departmentId?: string) {
    return http.get<LookupListResponse>('/v1/employees/lookups/job-titles', {
      params: departmentId ? { department_id: departmentId } : {},
    });
  },
};
