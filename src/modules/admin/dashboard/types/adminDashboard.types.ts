export interface AdminTeamStats {
  totalEmployees:    number;
  activeEmployees:   number;
  inactiveEmployees: number;
  activeProjects:    number;
  totalProjects:     number;
}

export interface AdminDashboardStats {
  pm:  AdminTeamStats;
  seo: AdminTeamStats;
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
