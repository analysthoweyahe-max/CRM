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
  value: string;
  label: string;
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
  name:         string;
  description:  string;
  project_type: string;
  status:       string;
  is_draft:     boolean;
  start_date:   string;
  deadline:     string;
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
