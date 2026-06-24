import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';

interface Params {
  page?:     number;
  per_page?: number;
  search?:   string;
}

export function useEmployeeList(params: Params = {}) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn:  () => employeeApi.list(params).then((r) => r.data.data),
  });
}
