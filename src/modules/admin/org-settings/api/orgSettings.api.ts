import { http } from '@/shared/services/http.service';
import type { OrgSettingsResponse, UpdateOrgSettingsPayload } from '../types/orgSettings.types';

export const orgSettingsApi = {
  get() {
    return http.get<OrgSettingsResponse>('/v1/settings/company');
  },

  update(payload: UpdateOrgSettingsPayload) {
    return http.put<OrgSettingsResponse>('/v1/settings/company', payload);
  },
};
