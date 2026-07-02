import { http } from '@/shared/services/http.service';
import type { PmTeamListApiResponse } from '../types/team.types';

export const pmTeamApi = {
  list(params: { search?: string; per_page?: number; page?: number }) {
    return http.get<PmTeamListApiResponse>('/v1/pm/team', { params });
  },
};
