import { http } from '@/shared/services/http.service';
import type { EmpProjectListResponse } from '../types/dashboard.types';

export const empDashboardApi = {
  myProjects() {
    return http.get<EmpProjectListResponse>('/v1/pm/my-projects');
  },
};
