/* ── Legacy mock-backed shapes ──────────────────────────────────────────
 * Still used by the tabs that have no backing endpoint yet (tasks/Kanban,
 * messages, per-project team chat seed). */

export interface TeamMember {
  initial:   string;
  color:     string;
  name:      string;
  role?:     string;
  email?:    string;
  isActive?: boolean;
}

export interface MemberProfile extends TeamMember {
  taskCount:    number;
  projectNames: string[];
  totalHours:   number;
}

/* ── Real API shapes (GET/POST/PUT/PATCH /v1/pm/projects) ──────────────── */

export interface PmLookupItem {
  value:    string;
  label:    string;
  labelAr?: string | null;
}

export interface PmProjectCreator {
  id:   string;
  name: string;
}

export interface PmProjectListItem {
  id:               number;
  name:             string;
  description:      string;
  projectType:      string;
  projectTypeLabel: string;
  status:           string;
  statusLabel:      string;
  isDraft:          boolean;
  startDate:        string;
  deadline:         string;
  teamAssignedAt:   string | null;
  workspaceUrl?:    string | null;
  // Confirmed via a live GET /v1/pm/projects/{id} response.
  githubLink?:      string | null;
  manager?:         PmProjectCreator | null;
  createdBy:        PmProjectCreator;
  createdAt:        string;
  updatedAt:        string;
}

export interface PmProjectTeamMember {
  id:            string;
  name:          string;
  email:         string;
  status:        string;
  projectRole:   string;
  department:    string;
  jobTitle:      string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface PmProjectPhase {
  id:                  number;
  uuid:                string;
  name:                string;
  description:         string;
  deliveryDate:        string | null;
  approvalStatus:      string;
  approvalStatusLabel: string;
  clientApprovedAt:    string | null;
  sortOrder:           number;
  attachments:         unknown[];
}

export interface PmProjectDetails extends PmProjectListItem {
  teamMembers: PmProjectTeamMember[];
  phases:      PmProjectPhase[];
}

export interface PmProjectListApiResponse {
  status:  string;
  message: string;
  data: {
    data:         PmProjectListItem[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface PmProjectDetailsApiResponse {
  status:  string;
  message: string;
  data:    PmProjectDetails;
}

export interface PmProjectApiResponse {
  status:  string;
  message: string;
  data:    PmProjectListItem;
}

export interface PmLookupApiResponse {
  status:  string;
  message: string;
  data:    PmLookupItem[];
}

export interface PmProjectPayload {
  name:            string;
  description:     string;
  project_type_id: number;
  status:          string;
  is_draft:        boolean;
  start_date:      string;
  deadline:        string;
  // The backend reads/writes this GitHub link under github_link (confirmed
  // via the project card response) — not workspace_url.
  github_link?:    string;
  // Super admin only — omit entirely for project-manager-initiated creates.
  manager_id?:     string;
}

/* ── Project types CRUD (admin-managed lookup) ──────────────────────────── */

export interface PmProjectTypeItem {
  id:         number;
  name:       string;
  nameAr:     string | null;
  isActive:   boolean;
  sortOrder:  number;
}

export interface PmProjectTypeListApiResponse {
  status:  string;
  message: string;
  data:    PmProjectTypeItem[];
}

export interface PmProjectTypeApiResponse {
  status:  string;
  message: string;
  data:    PmProjectTypeItem;
}

export interface PmProjectTypePayload {
  name:        string;
  name_ar:     string;
  is_active:   boolean;
  sort_order:  number;
}

/* ── Per-project team management (available / members / add / remove) ──── */

export interface PmAvailableMember {
  id:            string;
  name:          string;
  email:         string;
  status:        string;
  projectRole:   string | null;
  department:    string;
  jobTitle:      string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface PmProjectTeamListMember extends PmProjectTeamMember {
  projectTasksCount: number;
}

export interface PmAvailableMembersApiResponse {
  status:  string;
  message: string;
  data: {
    data:  PmAvailableMember[];
    total: number;
  };
}

export interface PmProjectTeamListApiResponse {
  status:  string;
  message: string;
  data: {
    data:         PmProjectTeamListMember[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface PmAddProjectMemberPayload {
  employee_id:  string;
  project_role: string;
}

/** POST /v1/pm/projects/{id}/team/members — bulk variant (never send alongside employee_id) */
export interface PmAddProjectMembersBulkPayload {
  employee_ids: string[];
  project_role: string;
}

/** POST /v1/pm/projects/{id}/team/invite — invite brand-new member */
export interface PmProjectInvitePayload {
  name:          string;
  email:         string;
  department_id: number;
  job_title_id:  number;
  project_role:  string;
}
