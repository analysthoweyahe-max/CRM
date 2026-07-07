import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import { useEmployeeList } from './useEmployeeList';

export function useDepartments() {
  return useQuery({
    queryKey: ['lookups', 'departments'],
    queryFn:  () => employeeApi.lookupDepartments().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useJobTitles(departmentId?: string) {
  return useQuery({
    queryKey: ['lookups', 'job-titles', departmentId ?? ''],
    queryFn:  () => employeeApi.lookupJobTitles(departmentId).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmploymentTypes() {
  return useQuery({
    queryKey: ['lookups', 'employment-types'],
    queryFn:  () => employeeApi.lookupEmploymentTypes().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
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
