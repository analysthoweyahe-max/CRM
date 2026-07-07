import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { departmentApi } from '../api/department.api';
import type { ApiDepartment, CreateDepartmentPayload, UpdateDepartmentPayload } from '../types/adminDepartment.types';

const DEPARTMENTS_KEY = ['admin', 'departments'];

export function useDepartmentList() {
  return useQuery({
    queryKey: DEPARTMENTS_KEY,
    queryFn:  () => departmentApi.list().then((r) => toApiArray<ApiDepartment>(r.data.data)),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateDepartmentPayload }) =>
      departmentApi.update(id, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => departmentApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY }),
  });
}
