import { pmTaskApi } from '@/modules/project-manager/tasks/api/task.api';
import { myTasksApi } from '@/shared/modules/my-tasks/api/myTasks.api';
import { mergeGroupedTasksAcrossProjects } from '@/shared/modules/my-tasks/utils/myTasks.utils';
import type { MyTask } from '@/shared/modules/my-tasks/types/myTasks.types';
import type { EmployeeTask, EmpTaskListResponse, EmpTaskStatus, EmpTaskPriority, CreateSelfTaskPayload } from '../types/employeeTask.types';

const STATUS_MAP: Record<string, EmpTaskStatus> = {
  pending:      'pending',
  needs_review: 'pending',
  in_progress:  'inProgress',
  completed:    'completed',
};

const PRIORITY_MAP: Record<string, EmpTaskPriority> = {
  low:    'low',
  normal: 'medium',
  medium: 'medium',
  high:   'high',
  urgent: 'high',
};

function toEmployeeTask(task: MyTask): EmployeeTask {
  return {
    id:        String(task.id),
    projectId: String(task.project?.id ?? ''),
    titleAr:   task.title,
    titleEn:   task.title,
    projectAr: task.project?.name ?? '',
    projectEn: task.project?.name ?? '',
    deadline:  task.dueDate ?? '',
    priority:  PRIORITY_MAP[task.priority] ?? 'medium',
    status:    STATUS_MAP[task.status] ?? 'pending',
    phaseId:   task.phase ? String(task.phase.id) : undefined,
    phaseName: task.phase?.name,
  };
}

export const employeeTaskApi = {
  /**
   * Aggregated client-side from the employee's own project list — the
   * backend's cross-project aggregate endpoint (`/v1/pm/employee/tasks`,
   * with or without `mine=1`) is confirmed unreliable, returning empty even
   * for accounts with real assigned tasks. `/v1/employee/projects` (project
   * membership) and the per-project task endpoint are both confirmed
   * working, so this fetches per project and merges here instead.
   */
  async list(): Promise<{ data: EmpTaskListResponse }> {
    const projects = await myTasksApi.listEmployeeProjects();
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
    const tasks = merged.columns.flatMap(c => c.tasks).map(toEmployeeTask);

    return {
      data: {
        status: 'true',
        data:   { data: tasks },
      },
    };
  },

  createSelfTask(projectId: string, payload: CreateSelfTaskPayload) {
    return pmTaskApi.createSelf(projectId, payload);
  },
};
