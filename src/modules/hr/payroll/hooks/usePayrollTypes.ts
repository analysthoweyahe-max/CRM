import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bonusTypesApi, deductionTypesApi } from '../api/payroll.api';
import { unwrapPayrollTypeList } from '../utils/payrollType.utils';
import type { CreatePayrollTypePayload, UpdatePayrollTypePayload } from '../types/payroll.types';

export function useBonusTypesAdmin() {
  return useQuery({
    queryKey: ['payroll', 'bonus-types'],
    queryFn:  () => bonusTypesApi.list().then((r) => unwrapPayrollTypeList(r.data.data)),
  });
}

export function useDeductionTypesAdmin() {
  return useQuery({
    queryKey: ['payroll', 'deduction-types'],
    queryFn:  () => deductionTypesApi.list().then((r) => unwrapPayrollTypeList(r.data.data)),
  });
}

function invalidateTypeLookups(qc: ReturnType<typeof useQueryClient>, kind: 'bonus' | 'deduction') {
  if (kind === 'bonus') {
    qc.invalidateQueries({ queryKey: ['payroll', 'bonus-types'] });
    qc.invalidateQueries({ queryKey: ['bonuses', 'lookups', 'types'] });
  } else {
    qc.invalidateQueries({ queryKey: ['payroll', 'deduction-types'] });
    qc.invalidateQueries({ queryKey: ['deductions', 'lookups', 'types'] });
  }
}

export function useCreateBonusType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayrollTypePayload) => bonusTypesApi.create(payload),
    onSuccess:  () => invalidateTypeLookups(qc, 'bonus'),
  });
}

export function useUpdateBonusType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayrollTypePayload }) =>
      bonusTypesApi.update(id, payload),
    onSuccess: () => invalidateTypeLookups(qc, 'bonus'),
  });
}

export function useDeleteBonusType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bonusTypesApi.remove(id),
    onSuccess:  () => invalidateTypeLookups(qc, 'bonus'),
  });
}

export function useCreateDeductionType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayrollTypePayload) => deductionTypesApi.create(payload),
    onSuccess:  () => invalidateTypeLookups(qc, 'deduction'),
  });
}

export function useUpdateDeductionType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayrollTypePayload }) =>
      deductionTypesApi.update(id, payload),
    onSuccess: () => invalidateTypeLookups(qc, 'deduction'),
  });
}

export function useDeleteDeductionType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deductionTypesApi.remove(id),
    onSuccess:  () => invalidateTypeLookups(qc, 'deduction'),
  });
}
