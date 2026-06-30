export interface AddSeoTaskForm {
  title:          string;
  description:    string;
  assignee:       string;
  priority:       string;
  dueDate:        string;
  estimatedHours: string;
  stage:          string;
  targetKeyword:  string;
  targetUrl:      string;
}

export interface CreateSeoTaskPayload {
  title:            string;
  description?:     string;
  assignee?:        string;
  priority:         string;
  due_date?:        string;
  estimated_hours?: number;
  stage?:           string;
  target_keyword?:  string;
  target_url?:      string;
  status:           string;
}
