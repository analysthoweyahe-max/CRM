import type { SeoTaskAttachment } from '@/shared/utils/seoTaskAttachment.utils';

export interface SeoTaskFull {
  id:               number;
  uuid?:            string;
  taskNumber:       number;
  phase:            string;
  phaseId?:         number | null;
  title:            string;
  description?:     string | null;
  taskType:         string;
  taskTypeLabel:    string;
  statusId?:        number | null;
  status:           string;
  statusLabel?:     string;
  priority:         string;
  priorityLabel?:   string;
  stage?:           string | null;
  estimatedHours?:  number | null;
  estimatedMinutes?: number | null;
  startDate?:       string | null;
  dueDate?:         string | null;
  siteLinks:        string[];
  referenceLinks:   string[];
  importantLinks?:  string[];
  notes?:           string | null;
  assignees:        SeoAssigneeDetail[];
  attachments:      SeoTaskAttachment[];
  attachmentsCount?: number;
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
  dueAt?:              string | null;
  isOverdue?:          boolean;
  isDelayed?:          boolean;
  overdueLabel?:       string | null;
  canExtend?:          boolean;
}

export interface SeoAssigneeDetail {
  id:      string;
  name:    string;
  avatar?: string | null;
}

/** @deprecated Use SeoTaskAttachment */
export type SeoAttachmentDetail = SeoTaskAttachment & {
  name?:        string;
  type?:        string;
  createdAt?:   string;
  uploadedBy?:  string;
};

/* Keep old aliases so existing imports don't break */
export type SeoTaskDetail  = SeoTaskFull;
export type SeoAssignee    = SeoAssigneeDetail;
export type SeoAttachment  = SeoAttachmentDetail;

export type SeoDrawerTab = 'info' | 'time' | 'attachments' | 'comments';
export type SeoTaskTab   = 'info' | 'assignees' | 'attachments';
