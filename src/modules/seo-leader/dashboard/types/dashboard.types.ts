export interface SeoTeamMember {
  uuid:   string;
  name:   string;
  avatar: string | null;
}

export interface SeoCampaign {
  uuid:            string;
  name:            string;
  client_name:     string;
  campaign_type:   string;
  start_date:      string;
  end_date:        string;
  progress:        number;
  status:          string;
  tasks_completed: number;
  tasks_total:     number;
  team:            SeoTeamMember[];
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
  per_page:     number;
}

export interface SeoManagerDashboard {
  stats:    SeoManagerStats;
  projects: SeoCampaign[] | PaginatedProjects;
}
