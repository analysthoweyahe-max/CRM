export interface OrgSettings {
  companyName:          string;
  officialEmail:        string;
  timezone:             string;
  annualLeave:          number;
  sickLeave:            number;
  maxCarryover:         number;
  notifyBeforeDays:     number;
  dailyWorkHours:          number;
  lateAllowanceMinutes:    number;
  normalStartWindowFrom:   string;
  normalStartWindowTo:     string;
  /** @deprecated use normalStartWindowFrom */
  workStartTime?:          string;
  /** @deprecated use normalStartWindowTo */
  workEndTime?:            string;
  updatedAt:            string;
}

export interface OrgSettingsResponse {
  status:  string;
  message: string;
  data:    OrgSettings;
}

export type UpdateOrgSettingsPayload = Omit<OrgSettings, 'updatedAt'>;
