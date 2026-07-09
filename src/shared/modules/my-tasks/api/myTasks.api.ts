import { http } from '@/shared/services/http.service';
import type { GroupedTasksData, TasksApiRole } from '../types/myTasks.types';
import {
  filterTasksForAssignee,
  getTasksEndpoint,
  getTasksQueryParams,
  normalizeGroupedTasks,
} from '../utils/myTasks.utils';

interface TasksApiEnvelope {
  status:  string;
  message: string;
  data:    unknown;
}

export const myTasksApi = {
  async list(
    tasksRole: TasksApiRole,
    projectId?: number | string,
    currentUserId?: string,
  ): Promise<GroupedTasksData> {
    const endpoint = getTasksEndpoint(tasksRole, projectId);
    const params   = getTasksQueryParams(tasksRole, projectId);
    const { data } = await http.get<TasksApiEnvelope>(endpoint, { params });
    const normalized = normalizeGroupedTasks(data.data);
    return filterTasksForAssignee(normalized, currentUserId);
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
