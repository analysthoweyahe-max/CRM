import type { EmpTaskStatus, EmpTaskPriority } from '@/modules/employee/tasks/types/employeeTask.types';

export interface SeoMemberStats {
  completed:   number;
  needsReview: number;
  inProgress:  number;
  pending:     number;
}

export interface SeoMemberTaskRaw {
  id:         string;
  titleAr:    string;
  titleEn:    string;
  campaignAr: string;
  campaignEn: string;
  deadline:   string;
  priority:   EmpTaskPriority;
  status:     EmpTaskStatus;
}

export interface SeoMemberDashboardData {
  stats:      SeoMemberStats;
  todayTasks: SeoMemberTaskRaw[];
}
