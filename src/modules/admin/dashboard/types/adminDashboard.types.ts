import type { PmDashboardStats } from '@/modules/project-manager/dashboard/hooks/usePmDashboard';
import type { SeoManagerStats } from '@/modules/seo-leader/dashboard/types/dashboard.types';

export interface AdminPmDashboardStats extends PmDashboardStats {
  teamMembers: number;
}

export interface AdminDashboardStats {
  pm:  AdminPmDashboardStats;
  seo: SeoManagerStats;
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
