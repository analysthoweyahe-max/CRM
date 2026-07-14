import { useMemo } from 'react';
import { useSeoTasks } from '@/modules/seo-member/tasks/hooks/useSeoTasks';
import { DailyReportCreateForm } from '@/shared/modules/daily-reports/components/DailyReportCreateForm';
import { useDailyReportCreateForm } from '@/shared/modules/daily-reports/hooks/useDailyReportCreateForm';
import type { DailyReportTaskOption } from '@/shared/modules/daily-reports/types/dailyReport.types';
import { useCreateDailyReport } from '../hooks/useDailyReports';

interface Props { isAr: boolean }

export function DailyReportForm({ isAr }: Props) {
  const { data, isLoading: tasksLoading } = useSeoTasks();
  const { mutate, isPending } = useCreateDailyReport();

  const taskOptions: DailyReportTaskOption[] = useMemo(
    () => (data?.tasks ?? []).map(t => ({
      id:    t.id,
      title: t.title,
      meta:  t.project?.name,
    })),
    [data?.tasks],
  );

  const form = useDailyReportCreateForm({
    isAr,
    taskOptions,
    tasksLoading,
    isPending,
    create: (payload, handlers) => mutate(payload, handlers),
  });

  return <DailyReportCreateForm {...form} isAr={isAr} />;
}
