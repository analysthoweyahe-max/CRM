import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', id],
    // Single-employee endpoint — needed for the full detail payload (roles,
    // permissions, roleDetails, roleManuallyAssigned) that the list response omits.
    queryFn: () => employeeApi.get(id!).then((r) => r.data.data),
    enabled: !!id,
  });
}
