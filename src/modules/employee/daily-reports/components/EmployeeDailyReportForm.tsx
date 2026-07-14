import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { myTasksApi } from '@/shared/modules/my-tasks/api/myTasks.api';
import { mergeGroupedTasksAcrossProjects } from '@/shared/modules/my-tasks/utils/myTasks.utils';
import { DailyReportCreateForm } from '@/shared/modules/daily-reports/components/DailyReportCreateForm';
import { useDailyReportCreateForm } from '@/shared/modules/daily-reports/hooks/useDailyReportCreateForm';
import type { DailyReportTaskOption } from '@/shared/modules/daily-reports/types/dailyReport.types';
import { useCreateDailyReport } from '../hooks/useDailyReports';

interface Props { isAr: boolean }

async function loadEmployeeTaskOptions(): Promise<DailyReportTaskOption[]> {
  const projects = await myTasksApi.listEmployeeProjects('pm-employee');
  const results = await Promise.all(
    projects.map(async (project) => {
      try {
        const data = await myTasksApi.list('pm-employee', { projectId: project.id });
        return { project, data };
      } catch {
        return null;
      }
    }),
  );
  const merged = mergeGroupedTasksAcrossProjects(
    results.filter((r): r is NonNullable<typeof r> => r !== null),
  );
  return merged.columns.flatMap(c => c.tasks).map(t => ({
    id:    t.id,
    title: t.title,
    meta:  t.project?.name,
  }));
}

export function EmployeeDailyReportForm({ isAr }: Props) {
  const { data: taskOptions = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['employee', 'daily-reports', 'my-tasks'],
    queryFn:  loadEmployeeTaskOptions,
    staleTime: 30_000,
  });

  const { mutate, isPending } = useCreateDailyReport();

  const options = useMemo(() => taskOptions, [taskOptions]);

  const form = useDailyReportCreateForm({
    isAr,
    taskOptions: options,
    tasksLoading,
    isPending,
    create: (payload, handlers) => mutate(payload, handlers),
  });

  return <DailyReportCreateForm {...form} isAr={isAr} />;
}
