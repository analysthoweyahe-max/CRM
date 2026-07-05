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
