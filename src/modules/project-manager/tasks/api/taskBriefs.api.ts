import { http } from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  TaskBriefsQuery,
  TaskBriefsResponse,
  TaskStatsResponse,
} from '@/shared/modules/task-briefs/types/taskBrief.types';

export const pmTaskBriefsApi = {
  /** GET /v1/pm/tasks/briefs — cross-project, paginated, filterable by status/project. */
  list: (query: TaskBriefsQuery = {}) =>
    http.get<ApiResponse<TaskBriefsResponse>>('/v1/pm/tasks/briefs', {
      params: {
        status:     query.status || undefined,
        project_id: query.projectId || undefined,
        page:       query.page ?? 1,
        per_page:   query.perPage ?? 12,
      },
    }),

  /** GET /v1/pm/tasks/stats — counts by status for the PM tasks stat card. */
  stats: () => http.get<ApiResponse<TaskStatsResponse>>('/v1/pm/tasks/stats'),
};
