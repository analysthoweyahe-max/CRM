import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '../api/department.api';
import type { CreateDepartmentPayload } from '../types/adminDepartment.types';

export function useDepartmentList() {
  return useQuery({
    queryKey: ['admin', 'departments'],
    queryFn:  () => departmentApi.list().then((r) => r.data.data),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'departments'] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => departmentApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'departments'] }),
  });
}
