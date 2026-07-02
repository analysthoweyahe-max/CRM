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
