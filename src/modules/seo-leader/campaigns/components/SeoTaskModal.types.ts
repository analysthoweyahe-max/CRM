export interface SeoTaskDetail {
  id:              number;
  title:           string;
  description?:    string;
  status:          string;
  statusLabel?:    string;
  priority:        string;
  stage?:          string;
  targetKeyword?:  string;
  targetUrl?:      string;
  dueDate?:        string;
  estimatedHours?: number;
  assignees:       SeoAssignee[];
  attachments:     SeoAttachment[];
  createdAt:       string;
  updatedAt:       string;
}

export interface SeoAssignee {
  id:      string;
  name:    string;
  avatar?: string | null;
}

export interface SeoAttachment {
  id:         number;
  name:       string;
  size?:      string;
  url?:       string;
  type?:      string;
  createdAt?: string;
}

export type SeoTaskTab = 'info' | 'assignees' | 'attachments';
