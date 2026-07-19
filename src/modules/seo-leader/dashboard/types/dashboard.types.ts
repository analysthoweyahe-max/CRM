import type { AttendanceTimer } from '@/shared/modules/attendance/types/attendanceTimer.types';

export interface SeoCampaign {
  id:               number;
  uuid?:            string;
  name:             string;
  description:      string;
  targetDomain:     string | null;
  campaignType:     string;
  campaignTypeLabel: string;
  status:           string;
  statusLabel:      string;
  isDraft:          boolean;
  startDate:        string;
  expectedEndDate:  string | null;
  targetKeywords:   string[];
  referenceLinks:   string[];
  githubLink?:              string | null;
  driveLink?:               string | null;
  contractDurationMonths?:  number | null;
  createdBy:                { id: string; name: string };
  createdAt:        string;
  updatedAt:        string;
  /** Present on dashboard project cards */
  tasksTotal?:      number;
  tasksCompleted?:  number;
  progressPercent?: number;
  teamMembers?:     SeoDashboardTeamMember[];
  teamMembersCount?: number;
  lastActivityAt?:  string;
  workspaceUrl?:    string;
}

export interface SeoDashboardTeamMember {
  id:            string;
  name:          string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface SeoDashboardProject {
  id:               number;
  name:             string;
  status:           string;
  statusLabel:      string;
  tasksTotal:       number;
  tasksCompleted:   number;
  progressPercent:  number;
  teamMembers:      SeoDashboardTeamMember[];
  teamMembersCount: number;
  lastActivityAt:   string;
  workspaceUrl?:    string;
  projectTypeLabel?: string;
  campaignTypeLabel?: string;
  description?:     string;
  startDate?:       string | null;
  expectedEndDate?: string | null;
  githubLink?:      string | null;
  isDraft?:         boolean;
}

export interface SeoDashboardProjectSection {
  key:             string;
  label:           string;
  defaultExpanded: boolean;
  total:           number;
  projects:        SeoDashboardProject[];
}

export interface SeoDashboardSummary {
  inProgress: number;
  completed:  number;
  onHold:     number;
  notStarted: number;
}

export interface SeoLeaderDashboardData {
  summary?:  SeoDashboardSummary;
  checkIn?:  Partial<AttendanceTimer>;
  projects?: {
    sections: SeoDashboardProjectSection[];
  };
  header?: unknown;
  sidebar?: unknown;
}

export interface SeoManagerStats {
  total_projects:     number;
  active_employees:   number;
  pending_tasks:      number;
  completed_projects: number;
}

export interface PaginatedProjects {
  data:         SeoCampaign[];
  total:        number;
  current_page: number;
  last_page:    number;
  per_page?:    number;
}

export interface SeoTeamMember {
  uuid:   string;
  name:   string;
  avatar: string | null;
}

export interface SeoManagerDashboard {
  stats:    SeoManagerStats;
  projects: SeoCampaign[] | PaginatedProjects;
}
