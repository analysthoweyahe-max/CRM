import { useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import type { ApiEmployee } from '../types/employee.types';

export function useEmployee(id: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      // 1. Search every cached list page (covers navigation from the list)
      const cached = queryClient.getQueriesData<{ data: ApiEmployee[] }>({ queryKey: ['employees'] });
      for (const [, page] of cached) {
        const found = page?.data?.find((emp) => String(emp.id) === id);
        if (found) return found;
      }

      // 2. Fallback: fetch the full list and filter by id
      const res = await employeeApi.list({ per_page: 500 });
      const emp = res.data.data.data.find((e) => String(e.id) === id);
      if (!emp) throw new Error(`Employee ${id} not found`);
      return emp;
    },
    enabled: !!id,
  });
}
