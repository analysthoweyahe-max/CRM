import { http } from '@/shared/services/http.service';

export interface PmCreateTaskPayload {
  title:            string;
  description?:     string;
  employee_id:      string;
  priority:         string;
  due_date:         string;
  estimated_hours?: number;
  phase_id:         number;
  status:           string;
}

export interface PmUpdateTaskPayload {
  title?:           string;
  priority?:        string;
  due_date?:        string;
  estimated_hours?: number;
}

export interface PmTaskApiResponse {
  status:  string;
  message: string;
  data:    { id: number | string };
}

export const pmTaskApi = {
  create(projectId: number | string, payload: PmCreateTaskPayload) {
    return http.post<PmTaskApiResponse>(`/v1/pm/projects/${projectId}/tasks`, payload);
  },

  update(projectId: number | string, taskId: string, payload: PmUpdateTaskPayload) {
    return http.post<PmTaskApiResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}`, payload);
  },

  updateStatus(projectId: number | string, taskId: string, status: string) {
    return http.patch<PmTaskApiResponse>(`/v1/pm/projects/${projectId}/tasks/${taskId}/status`, { status });
  },
};
