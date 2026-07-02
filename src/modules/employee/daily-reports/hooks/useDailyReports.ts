import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyReportApi } from '../api/dailyReport.api';
import type { StartDayPayload, EndDayPayload } from '../types/dailyReport.types';

export function useDailyReportList() {
  return useQuery({ queryKey: ['employee', 'daily-reports'], queryFn: () => dailyReportApi.list(), select: res => res.data.data.data });
}

function currentMonthRange() {
  const now      = new Date();
  const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const dateTo   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { date_from: dateFrom, date_to: dateTo };
}

export function useHistory() {
  return useQuery({
    queryKey: ['employee', 'daily-reports', 'history'],
    queryFn:  () => dailyReportApi.history(currentMonthRange()),
    select:   res => res.data.data.data,
  });
}

export function usePlannedTasks() {
  return useQuery({ queryKey: ['employee', 'daily-reports', 'planned-tasks'], queryFn: () => dailyReportApi.getPlannedTasks(), select: res => res.data.data.data });
}

export function useWorkedTasks() {
  return useQuery({ queryKey: ['employee', 'daily-reports', 'worked-tasks'], queryFn: () => dailyReportApi.getWorkedTasks(), select: res => res.data.data.data });
}

export function useWeeklySchedule() {
  return useQuery({ queryKey: ['employee', 'daily-reports', 'weekly'], queryFn: () => dailyReportApi.getWeeklySchedule(), select: res => res.data.data.data });
}

export function useDailyReportCreate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (fd: FormData) => dailyReportApi.create(fd), onSuccess: () => qc.invalidateQueries({ queryKey: ['employee', 'daily-reports'] }) });
}

export function useSubmitStartDay() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (p: StartDayPayload) => dailyReportApi.submitStartDay(p), onSuccess: () => qc.invalidateQueries({ queryKey: ['employee', 'daily-reports'] }) });
}

export function useSubmitEndDay() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (p: EndDayPayload) => dailyReportApi.submitEndDay(p), onSuccess: () => qc.invalidateQueries({ queryKey: ['employee', 'daily-reports'] }) });
}
