export interface PmTeamMemberApi {
  id:                  string;
  name:                string;
  email:               string;
  avatarUrl:           string | null;
  avatarInitial:       string;
  jobTitle:            string;
  department:          string;
  status:              string;
  isActive:            boolean;
  statusLabel:         string;
  activeProjectsCount: number;
  activeProjectsLabel: string;
  profileUrl:          string;
}

export interface PmTeamListApiResponse {
  status:  string;
  message: string;
  data: {
    data:         PmTeamMemberApi[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}
