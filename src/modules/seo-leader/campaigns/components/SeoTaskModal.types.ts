export interface SeoTaskFull {
  id:               number;
  taskNumber:       number;
  phase:            string;
  title:            string;
  description?:     string | null;
  taskType:         string;
  taskTypeLabel:    string;
  statusId?:        number | null;
  status:           string;
  statusLabel?:     string;
  priority:         string;
  priorityLabel?:   string;
  startDate?:       string | null;
  dueDate?:         string | null;
  siteLinks:        string[];
  referenceLinks:   string[];
  notes?:           string | null;
  assignees:        SeoAssigneeDetail[];
  attachments:      SeoAttachmentDetail[];
  stage?:           string | null;
  estimatedHours?:  number | null;
  completedAt?:     string | null;
  createdAt:        string;
  updatedAt:        string;
  createdBy?:       { id: string; name: string } | null;
  /* Extended SEO fields – returned if backend supports them */
  targetUrl?:          string | null;
  targetKeyword?:      string | null;
  searchIntent?:       string | null;
  searchVolume?:       number | null;
  keywordDifficulty?:  number | null;
  metaTitle?:          string | null;
  metaDescription?:    string | null;
}

export interface SeoAssigneeDetail {
  id:      string;
  name:    string;
  avatar?: string | null;
}

export interface SeoAttachmentDetail {
  id:          number;
  name:        string;
  size?:       string;
  url?:        string;
  type?:       string;
  uploadedBy?: string;
  createdAt?:  string;
}

/* Keep old aliases so existing imports don't break */
export type SeoTaskDetail  = SeoTaskFull;
export type SeoAssignee    = SeoAssigneeDetail;
export type SeoAttachment  = SeoAttachmentDetail;

export type SeoDrawerTab = 'info' | 'time' | 'attachments' | 'comments';
export type SeoTaskTab   = 'info' | 'assignees' | 'attachments';
