import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn:  () => employeeApi.get(id!).then((r) => r.data.data),
    enabled:  !!id,
  });
}
