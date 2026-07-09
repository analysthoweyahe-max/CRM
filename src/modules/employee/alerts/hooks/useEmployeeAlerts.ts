import { useQuery } from '@tanstack/react-query';
import { employeeAlertsApi } from '../api/alert.api';

export function useEmployeeAlertList() {
  return useQuery({
    queryKey: ['employee', 'alerts'],
    queryFn:  () => employeeAlertsApi.list({ per_page: 50 }).then((r) => r.data.data),
    staleTime: 10_000,
    // Near real-time delivery: poll so newly sent instructions surface without a
    // manual reload, and refresh whenever the tab regains focus.
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useEmployeeAlertDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', 'alerts', id],
    queryFn:  () => employeeAlertsApi.get(id!).then((r) => r.data.data),
    enabled: !!id,
  });
}
