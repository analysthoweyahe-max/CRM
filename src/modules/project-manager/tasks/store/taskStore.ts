import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAvatarColor } from '@/shared/utils';
import { parseImportantLinks } from '@/shared/utils/importantLinks.utils';
import { invalidateEmployeeHomeTasks } from '@/shared/modules/my-tasks/utils/invalidateHomeTasks.utils';
import { pmTaskApi } from '../api/task.api';
import type { RawPmTask } from '../api/task.api';
import type { Task, TaskPriority, TaskStatus } from '../types/task.types';

export function queryKey(projectId: string) {
  return ['pm-project-tasks', projectId, 'all'] as const;
}

export function toTask(raw: RawPmTask, projectId: string): Task {
  const createdBy = raw.createdBy ?? raw.created_by ?? null;
  const statusId = raw.statusId ?? raw.status_id ?? null;
  return {
    id: String(raw.id),
    uuid: raw.uuid || undefined,
    projectId,
    title: raw.title,
    description: raw.description ?? undefined,
    phaseId: raw.phase?.id,
    phaseName: raw.phase?.name,
    priority: raw.priority as TaskPriority,
    assigneeId: raw.assignee?.id,
    assigneeName: raw.assignee?.name ?? '',
    assigneeInitial: raw.assignee?.avatarInitial ?? '',
    assigneeColor: getAvatarColor(raw.assignee?.name ?? raw.title),
    dueDate: raw.dueDate ?? '',
    estimatedHours: raw.estimatedHours != null ? Number(raw.estimatedHours) : undefined,
    estimatedMinutes: raw.estimatedMinutes != null ? Number(raw.estimatedMinutes) : undefined,
    statusId,
    // Prefer numeric id for board grouping / status writes; fall back to legacy key.
    status: statusId != null ? String(statusId) : (raw.status as TaskStatus),
    taskNumber: `#${String(raw.taskNumber).padStart(3, '0')}`,
    dueAt: raw.dueAt ?? null,
    isOverdue: raw.isOverdue,
    isDelayed: raw.isDelayed,
    overdueLabel: raw.overdueLabel ?? null,
    canExtend: raw.canExtend,
    importantLinks: parseImportantLinks(raw),
    createdAt: raw.createdAt,
    createdById: createdBy?.id,
    createdByName: createdBy?.name,
  };
}

export function useProjectTasks(projectId: string): Task[] {
  const { data } = useQuery({
    queryKey: queryKey(projectId),
    queryFn:  () => pmTaskApi.list(projectId, { mine: false }).then(r =>
      r.data.data.columns.flatMap(c => c.tasks.map(t => toTask(t, projectId))),
    ),
    enabled: !!projectId,
  });

  return data ?? [];
}

/** Invalidate the task list after a create/update/status/delete mutation succeeds. */
export function useInvalidateProjectTasks(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKey(projectId) });
    // Keep employee home / My Tasks in sync when a PM creates or edits tasks.
    invalidateEmployeeHomeTasks(queryClient);
  };
}

/** Optimistically remove a task from the cached list — there is no confirmed
 * delete endpoint yet, so this only affects the current view (resets on refetch). */
export function useRemoveTaskLocally(projectId: string) {
  const queryClient = useQueryClient();
  return (taskId: string) => {
    queryClient.setQueryData<Task[]>(queryKey(projectId), (old) =>
      (old ?? []).filter(t => t.id !== taskId),
    );
  };
}
