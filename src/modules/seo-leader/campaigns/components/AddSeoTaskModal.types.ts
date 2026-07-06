export interface AddSeoTaskForm {
  title:          string;
  description:    string;
  assignee:       string;
  priority:       string;
  dueDate:        string;
  estimatedHours: string;
  targetKeyword:  string;
  targetUrl:      string;
}

export interface CreateSeoTaskPayload {
  title:               string;
  description?:        string;
  employee_id:         string;
  priority:            string;
  due_date?:           string;
  start_date?:         string;
  estimated_hours?:    number;
  phase_id:            number;
  status:              string;
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
