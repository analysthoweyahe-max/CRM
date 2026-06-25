export type SettingValue = string | number | boolean | null;

export type SettingsData = Record<string, SettingValue>;

export interface SettingsGetResponse {
  status:  string;
  message: string;
  data:    SettingsData;
}

export interface SettingUpdateResponse {
  status:  string;
  message: string;
  data: {
    key:   string;
    value: SettingValue;
  };
}
