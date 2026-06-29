import { http }                    from '@/shared/services/http.service';
import type { ApiResponse }         from '@/shared/types/api.types';
import type {
  CreateCampaignPayload,
  CampaignLookupResponse,
} from '../types/campaign.types';

export const campaignApi = {
  create(payload: CreateCampaignPayload) {
    return http.post<ApiResponse<{ uuid: string }>>('/v1/seo/projects', payload);
  },

  getCampaignTypes() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/campaign-types');
  },

  getStatuses() {
    return http.get<CampaignLookupResponse>('/v1/seo/projects/lookups/statuses');
  },
};
