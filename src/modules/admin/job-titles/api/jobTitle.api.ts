import { http } from '@/shared/services/http.service';
import type {
  JobTitleListResponse,
  JobTitleSingleResponse,
  CreateJobTitlePayload,
  UpdateJobTitlePayload,
  UpdateJobTitleResponse,
  DeleteJobTitleResponse,
} from '../types/adminJobTitle.types';

export const jobTitleApi = {
  list() {
    return http.get<JobTitleListResponse>('/v1/job-titles');
  },

  create(payload: CreateJobTitlePayload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('department_id', String(payload.department_id));
    formData.append('image', payload.image);
    return http.post<JobTitleSingleResponse>('/v1/job-titles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update(id: number | string, payload: UpdateJobTitlePayload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('department_id', String(payload.department_id));
    if (payload.image) formData.append('image', payload.image);
    return http.post<UpdateJobTitleResponse>(`/v1/job-titles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove(id: number | string) {
    return http.delete<DeleteJobTitleResponse>(`/v1/job-titles/${id}`);
  },
};
