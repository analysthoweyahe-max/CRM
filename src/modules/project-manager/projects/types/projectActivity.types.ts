/** Shared "Activity Log" feed shape for the project details Progress tab —
 *  used by both the PM (`/v1/pm/projects/{id}/activity`) and SEO
 *  (`/v1/seo/projects/{id}/activity`) endpoints, which return identical
 *  snake_case shapes by design. */

export interface ProjectActivityActor {
  id:             string;
  name:           string;
  avatar_url:     string | null;
  avatar_initial: string;
}

export interface ProjectActivityItem {
  id:          number;
  type:        string;
  description: string;
  actor:       ProjectActivityActor;
  created_at:  string;
  time_ago:    string;
}

export interface ProjectActivityPage {
  data:         ProjectActivityItem[];
  current_page: number;
  last_page:    number;
  per_page?:    number;
  total:        number;
}

export interface ProjectActivityApiResponse {
  status:  string;
  message: string;
  data:    ProjectActivityPage;
}
