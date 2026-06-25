import { http } from '@/shared/services/http.service';
import type { SettingsGetResponse, SettingUpdateResponse, SettingValue } from '../types/settings.types';

export const settingsApi = {
  get() {
    return http.get<SettingsGetResponse>('/v1/settings');
  },

  update(key: string, value: SettingValue) {
    return http.post<SettingUpdateResponse>(`/v1/settings/${key}`, { value });
  },
};
