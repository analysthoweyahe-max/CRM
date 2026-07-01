/* ── Global SEO team (not project-scoped) ─────────────────────────────── */

export interface SeoTeamApiMember {
  id:                  string;
  name:                string;
  email:               string;
  phone?:              string;
  avatarUrl:           string | null;
  avatarInitial:       string;
  team:                { id: number; name: string; nameAr: string };
  jobTitle:            { id: number; name: string } | null;
  status:              string;
  isActive:            boolean;
  statusLabel:         string;
  activeProjectsCount: number;
  createdAt:           string;
}

export interface SeoTeamPaginatedResponse {
  data:         SeoTeamApiMember[];
  current_page: number;
  last_page:    number;
  total:        number;
}

export interface SeoAttendanceOverview {
  date:           string;
  totalMembers:   number;
  presentToday:   number;
  absentToday:    number;
  onLeaveToday:   number;
  lateToday:      number;
}

export interface SeoPendingInvitation {
  id:          number;
  email:       string;
  name?:       string;
  role?:       string;
  invitedAt?:  string;
}

export interface SeoJobTitle {
  id:   number;
  name: string;
}

export interface SeoTeamInvitePayload {
  email:        string;
  name?:        string;
  job_title_id: number;
}

export interface SeoTeamApiResponse<T> {
  status:  string;
  message: string;
  data:    T;
}

/* ── Project-scoped (used inside campaign detail) ─────────────────────── */

export interface SeoProjectMember {
  id:                     string;
  name:                   string;
  email?:                 string;
  avatarUrl:              string | null;
  avatarInitial:          string;
  role?:                  string;
  projectRole?:           string;
  status:                 string;
  isActive:               boolean;
  statusLabel:            string;
  department?:            { id: number; name: string; nameAr: string };
  jobTitle?:              { id: number; name: string } | null;
  activeProjectsCount:    number;
  projectTasksCount:      number;
  projectTasksCompleted:  number;
  tasksCompletionPercent: number;
  isSelected?:            boolean;
  assignedAt?:            string | null;
}

export interface SeoAvailableMember {
  id:             string;
  name:           string;
  email?:         string;
  avatarUrl?:     string | null;
  avatarInitial?: string;
}

/** POST /v1/seo/projects/{id}/team/members — add existing employee */
export interface SeoAddMemberPayload {
  employee_id:  string;
  project_role: string;
}

/** POST /v1/seo/projects/{id}/team/invite — invite brand-new member */
export interface SeoProjectInvitePayload {
  name:          string;
  email:         string;
  department_id: number;
  job_title_id:  number;
  project_role:  string;
}

export interface SeoActivityItem {
  id:          number;
  description: string;
  created_at:  string;
  user?:       { uuid: string; name: string };
}
