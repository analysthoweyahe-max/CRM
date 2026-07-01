import { useQuery } from '@tanstack/react-query';
import { seoAttendanceApi } from '../api/seoAttendance.api';
import type { SeoAttendanceSummary, SeoAttendanceRecord } from '../types/seoAttendance.types';

function monthToRange(month: string) {
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    date_from: `${month}-01`,
    date_to:   `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

const EMPTY_SUMMARY: SeoAttendanceSummary = {
  month: '', presentDays: 0, absentDays: 0, lateCount: 0, earlyLeaveCount: 0, totalWorkHours: 0,
};

export function useSeoAttendanceSummary(month: string) {
  return useQuery({
    queryKey: ['seo-member', 'attendance', 'summary', month],
    queryFn:  () => seoAttendanceApi.summary(month),
    select:   res => (res.data.data ?? EMPTY_SUMMARY) as SeoAttendanceSummary,
    staleTime: 60_000,
  });
}

export function useSeoAttendanceHistory(month: string) {
  return useQuery({
    queryKey: ['seo-member', 'attendance', 'history', month],
    queryFn:  () => seoAttendanceApi.history({ ...monthToRange(month), per_page: 31 }),
    select:   res => (res.data.data?.data ?? []) as SeoAttendanceRecord[],
    staleTime: 60_000,
  });
}
