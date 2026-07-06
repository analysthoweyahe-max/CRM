export interface AddSeoTaskForm {
  title:          string;
  phase:          string;
  description:    string;
  assignee:       string;
  priority:       string;
  dueDate:        string;
  estimatedHours: string;
  targetKeyword:  string;
  targetUrl:      string;
}

/** POST /v1/seo/manager/projects/{id}/tasks — title/phase/employee_ids required, rest optional */
export interface CreateSeoTaskPayload {
  title:               string;
  phase:               string;
  employee_ids:        string[];
  description?:        string;
  priority?:           string;
  due_date?:           string;
  start_date?:         string;
  estimated_hours?:    number;
  status?:             string;
  target_keyword?:     string;
  target_url?:         string;
  search_intent?:      string;
  search_volume?:      number;
  keyword_difficulty?: number;
  meta_title?:         string;
  meta_description?:   string;
  site_links?:         string[];
  reference_links?:    string[];
  notes?:              string;
}
