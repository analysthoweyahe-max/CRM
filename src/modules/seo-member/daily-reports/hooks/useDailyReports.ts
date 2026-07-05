import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoDailyReportApi } from '../api/dailyReport.api';
import type { CreateDailyReportPayload, DayHistoryItem, RawDailyReportItem } from '../types/dailyReport.types';

const KEY = ['seo-member', 'daily-reports'];

function currentMonthRange() {
  const now      = new Date();
  const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const dateTo   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { date_from: dateFrom, date_to: dateTo };
}

function toHistoryItem(raw: RawDailyReportItem): DayHistoryItem {
  return {
    id:     String(raw.id ?? ''),
    // Presence of a report on a given day is the only signal we have — treat it as "completed".
    date:   raw.reportDate ?? raw.report_date ?? raw.date ?? '',
    status: 'completed',
  };
}

export function useHistory() {
  return useQuery({
    queryKey: [...KEY, 'history'],
    queryFn:  () => seoDailyReportApi.list(currentMonthRange()),
    select:   res => res.data.data.data.map(toHistoryItem),
  });
}

export function useCreateDailyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyReportPayload) => seoDailyReportApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
