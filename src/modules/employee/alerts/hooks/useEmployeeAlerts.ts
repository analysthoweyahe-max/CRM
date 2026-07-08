import { useQuery } from '@tanstack/react-query';
import { employeeAlertsApi } from '../api/alert.api';

export function useEmployeeAlertList() {
  return useQuery({
    queryKey: ['employee', 'alerts'],
    queryFn:  () => employeeAlertsApi.list({ per_page: 50 }).then((r) => r.data.data),
    staleTime: 30_000,
  });
}

export function useEmployeeAlertDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', 'alerts', id],
    queryFn:  () => employeeAlertsApi.get(id!).then((r) => r.data.data),
    enabled: !!id,
  });
}
