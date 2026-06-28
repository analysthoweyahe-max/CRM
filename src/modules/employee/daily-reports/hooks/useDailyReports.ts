import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyReportApi } from '../api/dailyReport.api';

export function useDailyReportList() {
  return useQuery({
    queryKey: ['employee', 'daily-reports'],
    queryFn:  () => dailyReportApi.list(),
    select:   res => res.data.data.data,
  });
}

export function useDailyReportCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => dailyReportApi.create(fd),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['employee', 'daily-reports'] }),
  });
}
