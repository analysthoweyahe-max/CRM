export type ProjectStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed';

export type MyProjectsModule = 'pm' | 'seo';

export interface PmProject {
  id:                     number;
  name:                   string;
  description:            string | null;
  githubLink:             string | null;
  driveLink:              string | null;
  contractDurationMonths: number | null;
  projectTypeId:          number;
  projectType:            string;
  projectTypeLabel:       string;
  status:                 ProjectStatus;
  statusLabel:            string;
  isDraft:                boolean;
  startDate:              string | null;
  deadline:               string | null;
  manager?:               { id: string; name: string };
  workspaceUrl?:          string | null;
  tasksUrl?:              string | null;
  tasksTotal?:            number;
  tasksCompleted?:        number;
  progressPercent?:       number;
  createdAt:              string;
  updatedAt:              string;
}

export interface SeoProject {
  id:                     number;
  name:                   string;
  targetDomain:           string | null;
  campaignType:           string;
  campaignTypeLabel:      string;
  status:                 ProjectStatus;
  statusLabel:            string;
  isDraft:                boolean;
  startDate:              string | null;
  expectedEndDate:        string | null;
  contractDurationMonths: number | null;
  githubLink:             string | null;
  driveLink:              string | null;
  workspaceUrl?:          string | null;
  tasksUrl?:              string | null;
  tasksAssigned?:         number;
  tasksCompleted?:        number;
  tasksInProgress?:       number;
  progressPercent?:       number;
}

export interface PaginatedProjectsResponse<T = PmProject | SeoProject> {
  data:         T[];
  current_page: number;
  last_page:    number;
  total:        number;
}

export interface DashboardProjectCard {
  id:               number;
  name:             string;
  clientName?:      string;
  status:           ProjectStatus;
  statusLabel:      string;
  workspaceUrl:     string;
  tasksUrl?:        string;
  tasksApiUrl?:     string;
  progressPercent?: number;
  tasksAssigned?:   number;
  tasksCompleted?:  number;
  tasksInProgress?: number;
  lastUpdatedAt?:   string;
}

export interface ProjectSection {
  key:             ProjectStatus | string;
  label:           string;
  defaultExpanded: boolean;
  total:           number;
  projects:        DashboardProjectCard[];
}

export interface StatusLookupItem {
  value:    string;
  label:    string;
  labelAr?: string | null;
}

export interface MyProjectsPageConfig {
  module:           MyProjectsModule;
  viewMode:         'paginated' | 'sections';
  canSearch:        boolean;
  canFilterStatus:  boolean;
  canToggleDraft:   boolean;
  canCreate:        boolean;
  showManager:      boolean;
  showTasksButton:  boolean;
  createPath:       string;
  workspacePath:    (projectId: number) => string;
  tasksPath:        (projectId: number) => string;
}

export type MyProjectListItem =
  | ({ kind: 'pm' } & PmProject)
  | ({ kind: 'seo' } & SeoProject)
  | ({ kind: 'dashboard' } & DashboardProjectCard);

export interface SeoMemberDashboardPayload {
  myProjects: {
    sections: ProjectSection[];
  };
}
