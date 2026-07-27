export interface EmpTasksOverview {
  totalAssigned: number;
  inProgress:    number;
  completed:     number;
}

export interface EmpProject {
  id:               number | string;
  name:             string;
  status:           string;
  statusLabel?:     string;
  startDate?:       string | null;
  endDate?:         string | null;
  tasksTotal?:      number;
  tasksCompleted?:  number;
  progressPercent?: number;
  tasksUrl?:        string;
  myProjectRole?:   string | null;
  module?:          'seo' | 'pm';
}

export interface EmpProjectListResponse {
  status:  string;
  message: string;
  data:    { data: EmpProject[] };
}
