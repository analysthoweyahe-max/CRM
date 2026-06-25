import { http } from '@/shared/services/http.service';
import type {
  DeductionListParams,
  DeductionListResponse,
  DeductionSingleResponse,
  DeductionLookupResponse,
  DeductionEmployeeLookupResponse,
  CreateDeductionPayload,
  UpdateDeductionStatusPayload,
  EmployeeDeductionListResponse,
} from '../types/payroll.types';

export const deductionsApi = {
  list(params?: DeductionListParams) {
    return http.get<DeductionListResponse>('/v1/payroll/deductions', { params });
  },

  create(payload: CreateDeductionPayload) {
    return http.post<DeductionSingleResponse>('/v1/payroll/deductions', payload);
  },

  show(id: string) {
    return http.get<DeductionSingleResponse>(`/v1/payroll/deductions/${id}`);
  },

  updateStatus(id: string, payload: UpdateDeductionStatusPayload) {
    return http.patch<DeductionSingleResponse>(`/v1/payroll/deductions/${id}/status`, payload);
  },

  lookupTypes() {
    return http.get<DeductionLookupResponse>('/v1/payroll/deductions/lookups/types');
  },

  lookupSources() {
    return http.get<DeductionLookupResponse>('/v1/payroll/deductions/lookups/sources');
  },

  lookupEmployee(employeeNumber: string) {
    return http.get<DeductionEmployeeLookupResponse>(
      '/v1/payroll/deductions/lookups/employee',
      { params: { employee_number: employeeNumber } },
    );
  },

  employeeDeductions(employeeId: string, params?: Pick<DeductionListParams, 'per_page' | 'page'>) {
    return http.get<EmployeeDeductionListResponse>(
      `/v1/payroll/employees/${employeeId}/deductions`,
      { params },
    );
  },
};
