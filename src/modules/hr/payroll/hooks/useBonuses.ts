import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bonusesApi } from '../api/payroll.api';
import type { BonusListParams, CreateBonusPayload, UpdateOvertimeSettingsPayload } from '../types/payroll.types';

export function useBonusList(params?: BonusListParams) {
  return useQuery({
    queryKey: ['bonuses', 'list', params],
    queryFn:  () => bonusesApi.list(params).then((r) => r.data.data),
  });
}

export function useBonusDetail(id?: string) {
  return useQuery({
    queryKey: ['bonuses', 'detail', id],
    queryFn:  () => bonusesApi.show(id!).then((r) => r.data.data),
    enabled:  !!id,
  });
}

export function useBonusTypes() {
  return useQuery({
    queryKey:  ['bonuses', 'lookups', 'types'],
    queryFn:   () => bonusesApi.lookupTypes().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOvertimeSettings() {
  return useQuery({
    queryKey:  ['bonuses', 'overtime', 'settings'],
    queryFn:   () => bonusesApi.overtimeSettings().then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateOvertimeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOvertimeSettingsPayload) => bonusesApi.updateOvertimeSettings(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bonuses', 'overtime', 'settings'] }),
  });
}

export function useProcessOvertime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (financial_month: string) => bonusesApi.processOvertime(financial_month),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bonuses'] }),
  });
}

export function useCreateBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBonusPayload) => bonusesApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bonuses'] }),
  });
}

export function useEmployeeBonuses(employeeId?: string) {
  return useQuery({
    queryKey: ['bonuses', 'employee', employeeId],
    queryFn:  () => bonusesApi.employeeBonuses(employeeId!).then((r) => r.data.data),
    enabled:  !!employeeId,
  });
}
