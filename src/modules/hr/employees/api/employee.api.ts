import { http } from '@/shared/services/http.service';
import type {
  EmployeeListResponse,
  EmployeeSingleResponse,
  LookupListResponse,
  EmploymentTypeLookupResponse,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  UpdateWorkSchedulePayload,
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

  update(id: string, payload: UpdateEmployeePayload) {
    return http.put<EmployeeSingleResponse>(`/v1/employees/${id}`, payload);
  },

  updateEmploymentType(id: string, payload: { employment_type: EmploymentType }) {
    return http.post<EmployeeSingleResponse>(`/v1/employees/${id}/employment-type`, payload);
  },

  updateSalary(id: string, payload: { salary: number }) {
    return http.put<EmployeeSingleResponse>(`/v1/employees/${id}/salary`, payload);
  },

  updateWorkSchedule(id: string, payload: UpdateWorkSchedulePayload) {
    return http.put<EmployeeSingleResponse>(`/v1/employees/${id}/work-schedule`, payload);
  },

  submit(id: string) {
    return http.post<EmployeeSingleResponse>(`/v1/employees/${id}/submit`, {});
  },

  remove(id: string) {
    return http.delete<{ status: string; message: string }>(`/v1/employees/${id}`);
  },

  bulkRemove(ids: string[]) {
    return http.post<{ status: string; message: string }>('/v1/employees/bulk-delete', { ids });
  },

  lookupDepartments() {
    return http.get<LookupListResponse>('/v1/employees/lookups/departments');
  },

  lookupJobTitles(departmentId?: string) {
    return http.get<LookupListResponse>('/v1/employees/lookups/job-titles', {
      params: departmentId ? { department_id: departmentId } : {},
    });
  },

  lookupEmploymentTypes() {
    return http.get<EmploymentTypeLookupResponse>('/v1/employees/lookups/employment-types');
  },
};
