export type PmProjectStatusKey = 'in_progress' | 'completed' | 'on_hold' | 'not_started';

export interface PmDashboardTeamMember {
  id:            string;
  name:          string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface PmDashboardProject {
  id:               number;
  name:             string;
  status:           PmProjectStatusKey;
  statusLabel:      string;
  projectType:      string;
  projectTypeLabel: string;
  tasksTotal:       number;
  tasksCompleted:   number;
  progressPercent:  number;
  teamMembers:      PmDashboardTeamMember[];
  teamMembersCount: number;
  lastActivityAt:   string;
  workspaceUrl:     string;
}

export interface PmDashboardProjectSection {
  key:             PmProjectStatusKey;
  label:           string;
  defaultExpanded: boolean;
  total:           number;
  projects:        PmDashboardProject[];
}

export interface PmDashboardSummary {
  inProgress: number;
  completed:  number;
  onHold:     number;
  notStarted: number;
}

export interface PmDashboardData {
  summary:  PmDashboardSummary;
  projects: {
    sections: PmDashboardProjectSection[];
  };
}

export interface PmDashboardApiResponse {
  status:  string;
  message: string;
  data:    PmDashboardData;
}
