import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoDailyReportApi } from '../api/dailyReport.api';
import { mapDailyReportHistoryItem } from '@/shared/modules/daily-reports/utils/mapDailyReport';
import type { CreateDailyReportPayload } from '../types/dailyReport.types';

const KEY = ['seo-member', 'daily-reports'];

function currentMonthRange() {
  const now      = new Date();
  const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const dateTo   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { date_from: dateFrom, date_to: dateTo };
}

export function useHistory() {
  return useQuery({
    queryKey: [...KEY, 'history'],
    queryFn:  () => seoDailyReportApi.list(currentMonthRange()),
    select:   res => res.data.data.data.map(mapDailyReportHistoryItem),
  });
}

export function useCreateDailyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyReportPayload) => seoDailyReportApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
