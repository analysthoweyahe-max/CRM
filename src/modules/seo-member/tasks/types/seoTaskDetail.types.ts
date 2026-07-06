import type { SeoTask } from './seoTask.types';

export interface SeoAssignee {
  id:       string;
  name:     string;
  initials: string;
  avatarBg: string;
}

export interface SeoTaskDetail extends SeoTask {
  assignees:         SeoAssignee[];
  createdBy:         { id: string; name: string } | null;
  startDate:         string | null;
  siteLinks:         string[];
  referenceLinks:    string[];
  notes:             string | null;
  targetUrl:         string | null;
  targetKeyword:     string | null;
  searchIntent:      string | null;
  searchVolume:      number | null;
  keywordDifficulty: number | null;
  metaTitle:         string | null;
  metaDescription:   string | null;
  allocatedHours:    number;
}

export interface SeoTaskDetailResponse {
  status:  string;
  message: string;
  data:    SeoTaskDetail;
}

/** GET/POST/PUT/DELETE .../comments — sender is whoever posted (admin or employee) */
export interface SeoTaskCommentSender {
  id:         string;
  name:       string;
  type:       string;
  avatarUrl?: string | null;
}

export interface SeoTaskComment {
  id:          number;
  body:        string;
  type:        string;
  sender:      SeoTaskCommentSender;
  mentions:    unknown[];
  attachments: unknown[];
  sentAt:      string;
}

export interface SeoTaskCommentsPage {
  data:         SeoTaskComment[];
  current_page: number;
  last_page:    number;
  total:        number;
}

/** GET/POST/DELETE .../time-logs */
export interface SeoTaskTimeLogEmployee {
  id:   string;
  name: string;
}

export interface SeoTaskTimeLog {
  id:            number;
  workDate:      string;
  startedAt:     string;
  endedAt:       string;
  durationHours: number;
  notes?:        string | null;
  employee:      SeoTaskTimeLogEmployee;
  createdAt:     string;
}

export interface SeoTaskTimeLogSummary {
  sessions:        SeoTaskTimeLog[];
  totalHours:      number;
  estimatedHours:  number;
  remainingHours:  number;
  progressPercent: number;
}

export interface AddTimeLogPayload {
  work_date:  string;
  started_at: string;
  ended_at:   string;
  notes?:     string;
}
