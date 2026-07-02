export interface OrgSettings {
  workDays:        string[];
  workStart:       string;
  workEnd:         string;
  timezone:        string;
  companyName:     string;
  companyEmail:    string;
  companyPhone:    string;
  companyWebsite:  string;
  companyAddress:  string;
  logoInitial:     string;
  passwordPolicy:  string;
  sessionTimeout:  string;
  twoFactorEnabled: boolean;
  inviteMethod:    string;
  defaultDepartment: string;
  defaultRole:     string;
}
