import { useQuery } from '@tanstack/react-query';
import { salariesApi } from '../api/payroll.api';
import type { SalaryListParams } from '../types/payroll.types';

export function useSalaryList(params?: SalaryListParams) {
  return useQuery({
    queryKey: ['payroll', 'salaries', 'list', params],
    queryFn:  () => salariesApi.list(params).then((r) => r.data.data),
  });
}
