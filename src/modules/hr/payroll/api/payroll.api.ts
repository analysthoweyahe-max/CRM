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
  BonusListParams,
  BonusListResponse,
  BonusSingleResponse,
  BonusLookupResponse,
  OvertimeSettingsResponse,
  UpdateOvertimeSettingsPayload,
  OvertimeProcessResponse,
  CreateBonusPayload,
  EmployeeBonusListResponse,
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

/* ── Bonuses API ────────────────────────────────────────────── */

export const bonusesApi = {
  list(params?: BonusListParams) {
    return http.get<BonusListResponse>('/v1/payroll/bonuses', { params });
  },

  create(payload: CreateBonusPayload) {
    return http.post<BonusSingleResponse>('/v1/payroll/bonuses', payload);
  },

  show(id: string) {
    return http.get<BonusSingleResponse>(`/v1/payroll/bonuses/${id}`);
  },

  lookupTypes() {
    return http.get<BonusLookupResponse>('/v1/payroll/bonuses/lookups/types');
  },

  lookupEmployee(employeeNumber: string) {
    return http.get('/v1/payroll/bonuses/lookups/employee', {
      params: { employee_number: employeeNumber },
    });
  },

  overtimeSettings() {
    return http.get<OvertimeSettingsResponse>('/v1/payroll/bonuses/overtime/settings');
  },

  updateOvertimeSettings(payload: UpdateOvertimeSettingsPayload) {
    return http.put<OvertimeSettingsResponse>('/v1/payroll/bonuses/overtime/settings', payload);
  },

  processOvertime(financial_month: string) {
    return http.post<OvertimeProcessResponse>(
      '/v1/payroll/bonuses/overtime/process',
      null,
      { params: { financial_month } },
    );
  },

  employeeBonuses(employeeId: string) {
    return http.get<EmployeeBonusListResponse>(`/v1/payroll/employees/${employeeId}/bonuses`);
  },
};
