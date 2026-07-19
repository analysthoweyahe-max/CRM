import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { employeeApi } from '../api/employee.api';
import { useEmployeeList } from './useEmployeeList';
import type { ApiLookup } from '../types/employee.types';

export function useDepartments() {
  return useQuery({
    queryKey: ['lookups', 'departments'],
    queryFn:  () => employeeApi.lookupDepartments().then((r) => toApiArray<ApiLookup>(r.data)),
    staleTime: 5 * 60_000,
  });
}

/**
 * Job-title lookup.
 * - Pass `departmentId` to filter server-side (and client-side as a safety net).
 * - Omit it to load every active title (manager forms that need the full list).
 */
export function useJobTitles(departmentId?: string) {
  return useQuery({
    queryKey: ['lookups', 'job-titles', departmentId ?? 'all'],
    queryFn: async () => {
      const list = await employeeApi
        .lookupJobTitles(departmentId)
        .then((r) => toApiArray<ApiLookup>(r.data));

      if (!departmentId) return list;

      // Client-side safety net if the API ignored department_id
      return list.filter((t) => {
        const dept = t.departmentId ?? t.department_id;
        return dept != null && dept !== '' && String(dept) === String(departmentId);
      });
    },
    staleTime: 5 * 60_000,
  });
}

export function useEmploymentTypes() {
  return useQuery({
    queryKey: ['lookups', 'employment-types'],
    queryFn:  () => employeeApi.lookupEmploymentTypes().then((r) => r.data.data ?? []),
    staleTime: 5 * 60_000,
  });
}

// No dedicated "managers" lookup endpoint exists — reuses the real employee
// roster (same /v1/employees list already used elsewhere) instead of mock data.
export function useManagerOptions(isAr: boolean, excludeId?: string) {
  const { data: employees, isLoading } = useEmployeeList();

  const items = useMemo(() => {
    const none = { id: 'none', label: isAr ? 'بدون مدير مباشر' : 'No direct manager' };
    const managers = (employees ?? [])
      .filter((e) => e.id !== excludeId)
      .map((e) => ({ id: e.id, label: e.name, detail: e.jobTitle?.name ?? undefined }));
    return [none, ...managers];
  }, [employees, excludeId, isAr]);

  return { items, isLoading };
}
