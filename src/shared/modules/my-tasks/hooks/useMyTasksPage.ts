import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { extractApiStatus } from '@/shared/utils/error.utils';
import { useSeoTaskLookups } from '@/modules/seo-leader/campaigns/hooks/useSeoTaskLookups';
import { myTasksApi } from '../api/myTasks.api';
import {
  annotateGroupedTasksOwnership,
  extractProjectsFromColumns,
  fillCatalogColumns,
  getTaskRouteId,
  mergeGroupedTasksAcrossProjects,
  resolveMyTasksConfig,
  resolveTasksRole,
} from '../utils/myTasks.utils';
import type {
  GroupedTasksData,
  MyTasksPageConfig,
  ResolveTasksRoleInput,
  TaskPhase,
  TasksApiRole,
} from '../types/myTasks.types';

/** Survives SPA navigation (task detail → back) but clears on full page refresh. */
const rememberedProjectFilterByRole: Partial<Record<'pm-employee' | 'seo-employee', string>> = {};

function readRememberedProjectFilter(
  routeProjectId: string | undefined,
  user: ResolveTasksRoleInput | null | undefined,
): string {
  if (routeProjectId) return routeProjectId;
  if (!user) return '';
  const role = resolveTasksRole(user);
  if (role === 'pm-employee' || role === 'seo-employee') {
    return rememberedProjectFilterByRole[role] ?? '';
  }
  return '';
}

function writeRememberedProjectFilter(tasksRole: TasksApiRole | null, id: string) {
  if (tasksRole === 'pm-employee' || tasksRole === 'seo-employee') {
    rememberedProjectFilterByRole[tasksRole] = id;
  }
}

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
  projectOptions:  { id: number | string; name: string }[];
  data:            GroupedTasksData | undefined;
  /** Only populated for the employee client-aggregate path (cross-project,
   *  unfiltered) — one unmerged result per project, for a per-project view. */
  perProjectData:  { project: { id: number | string; name: string }; data: GroupedTasksData }[] | undefined;
  isLoading:       boolean;
  isError:         boolean;
  errorStatus:     number | undefined;
  updateStatus:    (projectId: number | string, taskId: number | string, status: string) => Promise<void>;
  updatePhase:     (projectId: number | string, taskId: number | string, phase: TaskPhase) => Promise<void>;
  isUpdating:      boolean;
  getTaskId:       (task: import('../types/myTasks.types').MyTask) => string | number;
}

export function useMyTasksPage(isAr: boolean, options: UseMyTasksPageOptions = {}): UseMyTasksPageResult {
  const { user, can } = useAuth();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [projectId, setProjectIdState] = useState(() =>
    readRememberedProjectFilter(options.routeProjectId, user),
  );

  const tasksApiUrl = options.tasksApiUrl ?? searchParams.get('tasksApiUrl') ?? undefined;

  const tasksRole = useMemo(
    () => (user ? resolveTasksRole(user) : null),
    [user],
  );

  const setProjectId = (id: string) => {
    setProjectIdState(id);
    writeRememberedProjectFilter(tasksRole, id);
  };

  useEffect(() => {
    if (options.routeProjectId) {
      setProjectIdState(options.routeProjectId);
      writeRememberedProjectFilter(tasksRole, options.routeProjectId);
      return;
    }
    // Auth may load after first paint — restore in-memory filter once role is known.
    if (tasksRole === 'pm-employee' || tasksRole === 'seo-employee') {
      const remembered = rememberedProjectFilterByRole[tasksRole];
      if (remembered !== undefined) {
        setProjectIdState(remembered);
      }
    }
  }, [options.routeProjectId, tasksRole]);

  const config = useMemo(() => {
    if (!tasksRole) return null;
    const base = resolveMyTasksConfig(tasksRole);
    const editSlug =
      tasksRole === 'seo-employee' || tasksRole === 'seo-manager'
        ? 'edit-seo-tasks'
        : 'edit-pm-tasks';
    const canEdit = can(editSlug);
    return {
      ...base,
      canAddSelfTask: base.canAddSelfTask && canEdit,
      canDragStatus:  base.canDragStatus && canEdit,
    };
  }, [tasksRole, can]);

  // SEO task statuses are admin-configurable (not a fixed set) — fetch the
  // full catalog so the board always shows every status column, not just
  // whichever ones the current tasks happen to occupy.
  const isSeoEmployee = tasksRole === 'seo-employee';
  const { statusOptions: seoStatusCatalog } = useSeoTaskLookups(isAr, { enabled: isSeoEmployee });

  const scopedProjectId = projectId || undefined;

  // Both PM and SEO employees' cross-project "all my tasks" aggregate
  // endpoints are unreliable (confirmed empty for PM even with real assigned
  // tasks), so for these roles we source the project list from a
  // separately-confirmed endpoint and fetch/merge tasks per project instead.
  const isEmployeeRole = tasksRole === 'pm-employee' || tasksRole === 'seo-employee';
  const needsClientAggregate = isEmployeeRole && !scopedProjectId && !tasksApiUrl;

  const employeeProjectsQuery = useQuery({
    queryKey: ['my-tasks', tasksRole, 'employee-projects'],
    queryFn:  () => myTasksApi.listEmployeeProjects(tasksRole!),
    enabled:  isEmployeeRole,
    staleTime: 60_000,
  });

  const query = useQuery({
    queryKey: ['my-tasks', tasksRole, scopedProjectId, tasksApiUrl],
    queryFn:  () => myTasksApi.list(tasksRole!, {
      projectId: scopedProjectId,
      tasksApiUrl: tasksApiUrl ?? undefined,
    }),
    enabled: !!tasksRole && !needsClientAggregate,
  });

  const employeeProjects = employeeProjectsQuery.data ?? [];

  const aggregateQuery = useQuery({
    queryKey: ['my-tasks', tasksRole, 'employee-aggregate', employeeProjects.map(p => p.id)],
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
      // Project-scoped task payloads often omit `task.project`. Stamp it so
      // detail navigation / status updates work while "All projects" is selected
      // (filter projectId is empty — handleOpen can't fall back to it).
      const perProject = results
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .map(({ project, data }) => ({
          project,
          data: {
            ...data,
            columns: data.columns.map((col) => ({
              ...col,
              tasks: col.tasks.map((task) => ({
                ...task,
                project: task.project ?? project,
              })),
            })),
          },
        }));
      return { merged: mergeGroupedTasksAcrossProjects(perProject), perProject };
    },
    enabled: needsClientAggregate && !!employeeProjectsQuery.data,
  });

  const allProjectsQuery = useQuery({
    queryKey: ['my-tasks', 'all', tasksRole],
    queryFn:  () => myTasksApi.list(tasksRole!),
    enabled:  !!tasksRole && !scopedProjectId && !tasksApiUrl && !isEmployeeRole,
    staleTime: 60_000,
  });

  const projectOptions = useMemo(() => {
    if (isEmployeeRole) return employeeProjects;
    const source = allProjectsQuery.data ?? query.data;
    return source ? extractProjectsFromColumns(source.columns) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmployeeRole, employeeProjects, allProjectsQuery.data, query.data]);

  const activeQuery = needsClientAggregate ? aggregateQuery : query;
  const isLoading = needsClientAggregate
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
      qc.invalidateQueries({ queryKey: ['pm-dashboard'] });
      qc.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'employee-projects'] });
    },
  });

  async function updateStatus(
    pid: number | string,
    taskId: number | string,
    status: string,
  ) {
    await mutation.mutateAsync({ projectId: pid, taskId, status });
  }

  const phaseMutation = useMutation({
    mutationFn: ({
      projectId: pid,
      taskId,
      phase,
    }: {
      projectId: number | string;
      taskId:    number | string;
      phase:     TaskPhase;
    }) => myTasksApi.updatePhase(tasksRole!, pid, taskId, phase),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tasks', tasksRole] });
    },
  });

  async function updatePhase(
    pid: number | string,
    taskId: number | string,
    phase: TaskPhase,
  ) {
    await phaseMutation.mutateAsync({ projectId: pid, taskId, phase });
  }

  const getTaskId = (task: import('../types/myTasks.types').MyTask) =>
    tasksRole ? getTaskRouteId(task, tasksRole) : task.id;

  const rawPerProjectData = needsClientAggregate ? aggregateQuery.data?.perProject : undefined;
  const rawData = needsClientAggregate ? aggregateQuery.data?.merged : (query.data as GroupedTasksData | undefined);

  const statusCatalog = isSeoEmployee ? seoStatusCatalog : [];
  const withCatalog = rawData && statusCatalog.length > 0
    ? { ...rawData, columns: fillCatalogColumns(rawData.columns, statusCatalog) }
    : rawData;
  const withCatalogPerProject = rawPerProjectData && statusCatalog.length > 0
    ? rawPerProjectData.map(({ project, data: projectData }) => ({
        project,
        data: { ...projectData, columns: fillCatalogColumns(projectData.columns, statusCatalog) },
      }))
    : rawPerProjectData;

  // Employee / SEO-member boards stamp isMine so partner cards stay read-only.
  const ownershipUser = isEmployeeRole ? user : null;
  const data = withCatalog && ownershipUser
    ? annotateGroupedTasksOwnership(withCatalog, ownershipUser)
    : withCatalog;
  const perProjectData = withCatalogPerProject && ownershipUser
    ? withCatalogPerProject.map(({ project, data: projectData }) => ({
        project,
        data: annotateGroupedTasksOwnership(projectData, ownershipUser),
      }))
    : withCatalogPerProject;

  return {
    config,
    tasksRole,
    isAr,
    projectId,
    setProjectId,
    projectOptions,
    data,
    perProjectData,
    isLoading,
    isError:     activeQuery.isError,
    errorStatus: activeQuery.isError ? extractApiStatus(activeQuery.error) : undefined,
    updateStatus,
    updatePhase,
    isUpdating:  mutation.isPending,
    getTaskId,
  };
}
