export interface SeoCampaign {
  id:               number;
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
  // Consistent with the rest of this response's camelCase convention
  // (confirmed against the equivalent PM project response).
  githubLink?:      string | null;
  createdBy:        { id: string; name: string };
  createdAt:        string;
  updatedAt:        string;
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
