export interface OrgSettings {
  companyName:          string;
  officialEmail:        string;
  timezone:             string;
  annualLeave:          number;
  sickLeave:            number;
  maxCarryover:         number;
  notifyBeforeDays:     number;
  dailyWorkHours:       number;
  lateAllowanceMinutes: number;
  workStartTime:        string;
  workEndTime:          string;
  updatedAt:            string;
}

export interface OrgSettingsResponse {
  status:  string;
  message: string;
  data:    OrgSettings;
}

export type UpdateOrgSettingsPayload = Omit<OrgSettings, 'updatedAt'>;
