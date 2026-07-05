export interface AdminDashboardStats {
  totalEmployees:   number;
  activeEmployees:  number;
  pendingEmployees: number;
  activeProjects:   number;
  totalProjects:    number;
}

export interface RoleDistributionItem {
  labelAr: string;
  labelEn: string;
  value:   number;
  percent: number;
  color:   string;
}

export interface DepartmentDistributionItem {
  labelAr: string;
  labelEn: string;
  value:   number;
}

export type ActivityType = 'create' | 'update' | 'permission' | 'delete';

export interface ActivityItem {
  id:            string;
  type:          ActivityType;
  titleAr:       string;
  titleEn:       string;
  descriptionAr: string;
  descriptionEn: string;
  timeAr:        string;
  timeEn:        string;
}

export interface AdminDashboardData {
  stats:                  AdminDashboardStats;
  roleDistribution:       RoleDistributionItem[];
  departmentDistribution: DepartmentDistributionItem[];
  activity:               ActivityItem[];
}
