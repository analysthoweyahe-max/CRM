import type { SeoTask } from './seoTask.types';

export interface SeoAssignee {
  id:       number;
  name:     string;
  initials: string;
  avatarBg: string;
}

export interface SeoTaskDetail extends SeoTask {
  assignees:         SeoAssignee[];
  createdBy:         string;
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
