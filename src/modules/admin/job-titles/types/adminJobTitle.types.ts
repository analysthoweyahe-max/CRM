export interface ApiJobTitle {
  id:   number;
  name: string;
}

export interface JobTitleListResponse {
  status:  string;
  message: string;
  data:    ApiJobTitle[];
}

export interface JobTitleSingleResponse {
  status:  string;
  message: string;
  data:    ApiJobTitle;
}

export interface CreateJobTitlePayload {
  name:          string;
  department_id: string | number;
  image:         File;
}

export interface UpdateJobTitlePayload {
  name:          string;
  department_id: string | number;
  image?:        File;
}

// The backend returns the full refreshed job-titles list on create/update/delete instead of a bare ack.
export type DeleteJobTitleResponse = JobTitleListResponse;
export type UpdateJobTitleResponse = JobTitleListResponse;
