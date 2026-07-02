import type { PermissionAction } from '../../roles/types/adminRole.types';

export type AdminEmployeeStatus = 'active' | 'disabled' | 'pending';

export interface AdminEmployee {
  id:            string;
  name:          string;
  email:         string;
  avatarInitial: string;
  avatarColor:   string;
  department:    string;
  jobTitle:      string;
  role:          string;
  status:        AdminEmployeeStatus;
  statusLabelAr: string;
  statusLabelEn: string;
  lastLoginAr:   string;
  lastLoginEn:   string;
}

export interface AdminEmployeeActivity {
  id:      string;
  titleAr: string;
  titleEn: string;
  timeAr:  string;
  timeEn:  string;
}

export interface AdminEmployeeStats {
  projects:        number;
  tasksAssigned:   number;
  totalHours:      number;
  completionRate:  number;
}

export interface AdminEmployeeDetail extends AdminEmployee {
  phone:              string;
  address:            string;
  employeeNumber:     string;
  managerName:        string;
  joiningDateAr:      string;
  joiningDateEn:      string;
  employmentTypeAr:   string;
  employmentTypeEn:   string;
  accountCreatedAr:   string;
  accountCreatedEn:   string;
  stats:              AdminEmployeeStats;
  activity:           AdminEmployeeActivity[];
  customPermissions:  Record<string, PermissionAction[]>;
}

export interface NewAdminEmployeeInput {
  fullName:      string;
  email:         string;
  phone:         string;
  address:       string;
  jobTitle:      string;
  department:    string;
  managerId:     string;
  joiningDate:   string;
  role:          string;
  accountStatus: string;
}
