import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { extractApiStatus } from '@/shared/utils/error.utils';
import { myTasksApi } from '../api/myTasks.api';
import {
  extractProjectsFromColumns,
  resolveMyTasksConfig,
  resolveTasksRole,
} from '../utils/myTasks.utils';
import type { GroupedTasksData, MyTasksPageConfig, TasksApiRole } from '../types/myTasks.types';

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
}

export function useMyTasksPage(isAr: boolean): UseMyTasksPageResult {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [projectId, setProjectId] = useState('');

  const tasksRole = useMemo(
    () => (user ? resolveTasksRole(user) : null),
    [user],
  );

  const config = useMemo(
    () => (tasksRole ? resolveMyTasksConfig(tasksRole) : null),
    [tasksRole],
  );

  const currentUserId = user?.employeeId ?? user?.id;

  const scopedProjectId = projectId || undefined;

  const query = useQuery({
    queryKey: ['my-tasks', tasksRole, scopedProjectId, currentUserId],
    queryFn:  () => myTasksApi.list(tasksRole!, scopedProjectId, currentUserId),
    enabled:  !!tasksRole && !!currentUserId,
  });

  const allProjectsQuery = useQuery({
    queryKey: ['my-tasks', 'all', tasksRole, currentUserId],
    queryFn:  () => myTasksApi.list(tasksRole!, undefined, currentUserId),
    enabled:  !!tasksRole && !!currentUserId,
    staleTime: 60_000,
  });

  const projectOptions = useMemo(() => {
    const source = allProjectsQuery.data ?? query.data;
    return source ? extractProjectsFromColumns(source.columns) : [];
  }, [allProjectsQuery.data, query.data]);

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

  return {
    config,
    tasksRole,
    isAr,
    projectId,
    setProjectId,
    projectOptions,
    data:        query.data,
    isLoading:   query.isLoading,
    isError:     query.isError,
    errorStatus: query.isError ? extractApiStatus(query.error) : undefined,
    updateStatus,
    isUpdating:  mutation.isPending,
  };
}
