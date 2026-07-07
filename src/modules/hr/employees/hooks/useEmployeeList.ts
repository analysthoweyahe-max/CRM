import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import type { ApiEmployee } from '../types/employee.types';

const FETCH_PAGE_SIZE = 100;

// Backend `search` matching isn't reliable for Arabic name variants (e.g. "احمد" vs "أحمد"),
// so the full roster is fetched once and searched/paginated client-side with normalization
// instead (same approach as useSeoTeamPage / useProjectTeamPage).
async function fetchAllEmployees(): Promise<ApiEmployee[]> {
  const first = await employeeApi.list({ per_page: FETCH_PAGE_SIZE, page: 1 });
  const { data: firstBatch, last_page } = first.data.data;
  if (last_page <= 1) return firstBatch;

  const restPages = Array.from({ length: last_page - 1 }, (_, i) => i + 2);
  const rest = await Promise.all(
    restPages.map(page => employeeApi.list({ per_page: FETCH_PAGE_SIZE, page }).then(r => r.data.data.data)),
  );
  return [firstBatch, ...rest].flat();
}

export function useEmployeeList() {
  return useQuery({
    queryKey: ['employees', 'all'],
    queryFn:  fetchAllEmployees,
    staleTime: 30_000,
  });
}
