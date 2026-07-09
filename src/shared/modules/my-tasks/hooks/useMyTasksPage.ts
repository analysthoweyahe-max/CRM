import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { extractApiStatus } from '@/shared/utils/error.utils';
import { myTasksApi } from '../api/myTasks.api';
import {
  extractProjectsFromColumns,
  getTaskRouteId,
  mergeGroupedTasksAcrossProjects,
  resolveMyTasksConfig,
  resolveTasksRole,
} from '../utils/myTasks.utils';
import type { GroupedTasksData, MyTasksPageConfig, TasksApiRole } from '../types/myTasks.types';

export interface UseMyTasksPageOptions {
  routeProjectId?: string;
  tasksApiUrl?:   string;
}

export interface UseMyTasksPageResult {
  config:          MyTasksPageConfig | null;
  tasksRole:       TasksApiRole | null;
  isAr:            boolean;
  projectId:       string;
  setProjectId:    (id: string) => void;
  projectOptions:  { id: number; name: string }[];
  data:            GroupedTasksData | undefined;
  isLoading:       boolean;
  isError:         boolean;
  errorStatus:     number | undefined;
  updateStatus:    (projectId: number | string, taskId: number | string, status: string) => Promise<void>;
  isUpdating:      boolean;
  getTaskId:       (task: import('../types/myTasks.types').MyTask) => string | number;
}

export function useMyTasksPage(isAr: boolean, options: UseMyTasksPageOptions = {}): UseMyTasksPageResult {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [projectId, setProjectId] = useState(options.routeProjectId ?? '');

  useEffect(() => {
    if (options.routeProjectId) {
      setProjectId(options.routeProjectId);
    }
  }, [options.routeProjectId]);

  const tasksApiUrl = options.tasksApiUrl ?? searchParams.get('tasksApiUrl') ?? undefined;

  const tasksRole = useMemo(
    () => (user ? resolveTasksRole(user) : null),
    [user],
  );

  const config = useMemo(
    () => (tasksRole ? resolveMyTasksConfig(tasksRole) : null),
    [tasksRole],
  );

  const scopedProjectId = projectId || undefined;

  // PM employee's cross-project "all my tasks" aggregate endpoint doesn't
  // reliably return data (confirmed empty even with real assigned tasks),
  // so for this role we source the project list from a separately-confirmed
  // endpoint and fetch/merge tasks per project instead.
  const isPmEmployeeAggregate = tasksRole === 'pm-employee' && !scopedProjectId && !tasksApiUrl;

  const employeeProjectsQuery = useQuery({
    queryKey: ['my-tasks', tasksRole, 'employee-projects'],
    queryFn:  () => myTasksApi.listEmployeeProjects(),
    enabled:  tasksRole === 'pm-employee',
    staleTime: 60_000,
  });

  const query = useQuery({
    queryKey: ['my-tasks', tasksRole, scopedProjectId, tasksApiUrl],
    queryFn:  () => myTasksApi.list(tasksRole!, {
      projectId: scopedProjectId,
      tasksApiUrl: tasksApiUrl ?? undefined,
    }),
    enabled: !!tasksRole && !isPmEmployeeAggregate,
  });

  const employeeProjects = employeeProjectsQuery.data ?? [];

  const aggregateQuery = useQuery({
    queryKey: ['my-tasks', tasksRole, 'pm-aggregate', employeeProjects.map(p => p.id)],
    queryFn: async () => {
      const results = await Promise.all(
        employeeProjects.map(async (project) => {
          try {
            const data = await myTasksApi.list(tasksRole!, { projectId: project.id });
            return { project, data };
          } catch {
            return null;
          }
        }),
      );
      return mergeGroupedTasksAcrossProjects(results.filter((r): r is NonNullable<typeof r> => r !== null));
    },
    enabled: isPmEmployeeAggregate && !!employeeProjectsQuery.data,
  });

  const allProjectsQuery = useQuery({
    queryKey: ['my-tasks', 'all', tasksRole],
    queryFn:  () => myTasksApi.list(tasksRole!),
    enabled:  !!tasksRole && !scopedProjectId && !tasksApiUrl && tasksRole !== 'pm-employee',
    staleTime: 60_000,
  });

  const projectOptions = useMemo(() => {
    if (tasksRole === 'pm-employee') return employeeProjects;
    const source = allProjectsQuery.data ?? query.data;
    return source ? extractProjectsFromColumns(source.columns) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksRole, employeeProjects, allProjectsQuery.data, query.data]);

  const activeQuery = isPmEmployeeAggregate ? aggregateQuery : query;
  const isLoading = isPmEmployeeAggregate
    ? (employeeProjectsQuery.isLoading || aggregateQuery.isLoading)
    : activeQuery.isLoading;

  const mutation = useMutation({
    mutationFn: ({
      projectId: pid,
      taskId,
      status,
    }: {
      projectId: number | string;
      taskId:    number | string;
      status:    string;
    }) => myTasksApi.updateStatus(tasksRole!, pid, taskId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tasks', tasksRole] });
    },
  });

  async function updateStatus(
    pid: number | string,
    taskId: number | string,
    status: string,
  ) {
    await mutation.mutateAsync({ projectId: pid, taskId, status });
  }

  const getTaskId = (task: import('../types/myTasks.types').MyTask) =>
    tasksRole ? getTaskRouteId(task, tasksRole) : task.id;

  return {
    config,
    tasksRole,
    isAr,
    projectId,
    setProjectId,
    projectOptions,
    data:        activeQuery.data,
    isLoading,
    isError:     activeQuery.isError,
    errorStatus: activeQuery.isError ? extractApiStatus(activeQuery.error) : undefined,
    updateStatus,
    isUpdating:  mutation.isPending,
    getTaskId,
  };
}
