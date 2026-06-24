import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';

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
