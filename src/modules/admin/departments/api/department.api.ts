import { http } from '@/shared/services/http.service';
import type {
  DepartmentListResponse,
  DepartmentSingleResponse,
  CreateDepartmentPayload,
  DeleteDepartmentResponse,
} from '../types/adminDepartment.types';

export const departmentApi = {
  list() {
    return http.get<DepartmentListResponse>('/v1/departments');
  },

  create(payload: CreateDepartmentPayload) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('image', payload.image);
    return http.post<DepartmentSingleResponse>('/v1/departments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove(id: number | string) {
    return http.delete<DeleteDepartmentResponse>(`/v1/departments/${id}`);
  },
};
