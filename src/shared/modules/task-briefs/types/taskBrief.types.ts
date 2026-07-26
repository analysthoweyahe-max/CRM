export interface TaskBriefProject {
  id:   string | number;
  name: string;
}

export interface TaskBrief {
  id:            string | number;
  title:         string;
  status:        { key: string; label: string; color: string | null };
  project:       TaskBriefProject | null;
  priority:      string | null;
  dueDate:       string | null;
  assigneeName:  string | null;
}

/** Laravel-style paginator envelope. */
export interface TaskBriefsResponse {
  data:         TaskBrief[];
  current_page: number;
  last_page:    number;
  total:        number;
  per_page:     number;
}

export interface TaskStatusCount {
  key:   string;
  label: string;
  color: string | null;
  count: number;
}

export interface TaskStatsResponse {
  total:    number;
  byStatus: TaskStatusCount[];
}

export interface TaskBriefsQuery {
  status?:    string;
  projectId?: string | number;
  page?:      number;
  perPage?:   number;
}
