import { http } from '@/shared/services/http.service';
import type { EmployeeAlertListResponse, EmployeeAlertSingleResponse } from '../types/alert.types';

export const employeeAlertsApi = {
  list(params: { per_page?: number; page?: number } = {}) {
    return http.get<EmployeeAlertListResponse>('/v1/employee/alerts', { params });
  },

  get(id: string | number) {
    return http.get<EmployeeAlertSingleResponse>(`/v1/employee/alerts/${id}`);
  },
};
