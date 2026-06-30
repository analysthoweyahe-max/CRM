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
  uuid:         string;
  name:         string;
  email?:       string;
  role?:        string;
  avatar:       string | null;
  is_active?:   boolean;
  tasks_count?: number;
}

export interface SeoAvailableMember {
  uuid:   string;
  name:   string;
  email?: string;
  avatar: string | null;
}

export interface SeoProjectInvitePayload {
  employee_uuid: string;
  role?:         string;
}

export interface SeoActivityItem {
  id:          number;
  description: string;
  created_at:  string;
  user?:       { uuid: string; name: string };
}
