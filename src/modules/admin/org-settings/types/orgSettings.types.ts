export interface OrgLeaveType {
  value:         string;
  labelEn:       string;
  labelAr:       string;
  tracksBalance: boolean;
  /** Yearly entitlement in days for this leave type. Only meaningful when `tracksBalance` is true. */
  days:          number;
}

export interface OrgSettings {
  companyName:          string;
  officialEmail:        string;
  timezone:             string;
  annualLeave:          number;
  casualLeave:          number;
  sickLeave:            number;
  maxCarryover:         number;
  notifyBeforeDays:     number;
  leaveTypes:           OrgLeaveType[];
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
