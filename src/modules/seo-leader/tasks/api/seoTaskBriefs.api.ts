import { http } from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  TaskBriefsQuery,
  TaskBriefsResponse,
  TaskStatsResponse,
} from '@/shared/modules/task-briefs/types/taskBrief.types';

export const seoTaskBriefsApi = {
  /** GET /v1/seo/manager/tasks/briefs — cross-project, paginated, filterable by status/project. */
  list: (query: TaskBriefsQuery = {}) =>
    http.get<ApiResponse<TaskBriefsResponse>>('/v1/seo/manager/tasks/briefs', {
      params: {
        status:     query.status || undefined,
        project_id: query.projectId || undefined,
        page:       query.page ?? 1,
        per_page:   query.perPage ?? 12,
      },
    }),

  /** GET /v1/seo/manager/tasks/stats — counts by status for the SEO tasks stat card. */
  stats: () => http.get<ApiResponse<TaskStatsResponse>>('/v1/seo/manager/tasks/stats'),
};
