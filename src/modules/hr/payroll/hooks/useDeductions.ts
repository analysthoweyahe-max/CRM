import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deductionsApi } from '../api/payroll.api';
import type {
  DeductionListParams,
  CreateDeductionPayload,
  DeductionStatus,
} from '../types/payroll.types';

export function useDeductionList(params?: DeductionListParams) {
  return useQuery({
    queryKey: ['deductions', 'list', params],
    queryFn:  () => deductionsApi.list(params).then((r) => r.data.data),
  });
}

export function useDeductionDetail(id?: string) {
  return useQuery({
    queryKey: ['deductions', 'detail', id],
    queryFn:  () => deductionsApi.show(id!).then((r) => r.data.data),
    enabled:  !!id,
  });
}

export function useDeductionTypes() {
  return useQuery({
    queryKey: ['deductions', 'lookups', 'types'],
    queryFn:  () => deductionsApi.lookupTypes().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeductionSources() {
  return useQuery({
    queryKey: ['deductions', 'lookups', 'sources'],
    queryFn:  () => deductionsApi.lookupSources().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeductionEmployeeLookup(employeeNumber: string) {
  return useQuery({
    queryKey: ['deductions', 'lookups', 'employee', employeeNumber],
    queryFn:  () => deductionsApi.lookupEmployee(employeeNumber).then((r) => r.data.data),
    enabled:  employeeNumber.trim().length >= 3,
  });
}

export function useCreateDeduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDeductionPayload) => deductionsApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['deductions'] }),
  });
}

export function useUpdateDeductionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeductionStatus }) =>
      deductionsApi.updateStatus(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deductions'] }),
  });
}

export function useEmployeeDeductions(employeeId?: string) {
  return useQuery({
    queryKey: ['deductions', 'employee', employeeId],
    queryFn:  () => deductionsApi.employeeDeductions(employeeId!).then((r) => r.data.data),
    enabled:  !!employeeId,
  });
}
