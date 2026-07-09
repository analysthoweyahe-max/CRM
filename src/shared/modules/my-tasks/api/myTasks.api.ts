import { http } from '@/shared/services/http.service';
import type { GroupedTasksData, TasksApiRole } from '../types/myTasks.types';
import {
  getTasksEndpoint,
  getTasksQueryParams,
  normalizeGroupedTasks,
  resolveTasksApiPath,
} from '../utils/myTasks.utils';

interface TasksApiEnvelope {
  status:  string;
  message: string;
  data:    unknown;
}

export interface ListMyTasksOptions {
  projectId?:    number | string;
  tasksApiUrl?:  string;
}

export const myTasksApi = {
  async list(
    tasksRole: TasksApiRole,
    options: ListMyTasksOptions = {},
  ): Promise<GroupedTasksData> {
    const { projectId, tasksApiUrl } = options;
    const endpoint = tasksApiUrl
      ? resolveTasksApiPath(tasksApiUrl)
      : getTasksEndpoint(tasksRole, projectId);
    const params = tasksApiUrl ? {} : getTasksQueryParams(tasksRole, projectId);
    const { data } = await http.get<TasksApiEnvelope>(endpoint, { params });
    return normalizeGroupedTasks(data);
  },

  updateStatus(
    tasksRole: TasksApiRole,
    projectId: number | string,
    taskId: number | string,
    status: string,
  ) {
    switch (tasksRole) {
      case 'pm-employee':
      case 'project-manager':
        return http.patch(
          `/v1/pm/projects/${projectId}/tasks/${taskId}/status`,
          { status },
        );
      case 'seo-employee':
        return http.patch(
          `/v1/seo/employee/projects/${projectId}/tasks/${taskId}/status`,
          { status },
        );
      case 'seo-manager':
        return http.patch(
          `/v1/seo/manager/projects/${projectId}/tasks/${taskId}/status`,
          { status },
        );
    }
  },
};
