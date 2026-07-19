import { http } from '@/shared/services/http.service';
import type {
  AdminRequestCreatePayload,
  AdminRequestListParams,
  AdminRequestListResponse,
  AdminRequestNamespace,
  AdminRequestSingleResponse,
  AdminRequestTypesResponse,
} from '../types/adminRequest.types';

export function createAdminRequestsApi(ns: AdminRequestNamespace) {
  const base = `/v1/${ns}/requests`;

  return {
    types() {
      return http.get<AdminRequestTypesResponse>(`${base}/lookups/types`);
    },

    list(params?: AdminRequestListParams) {
      return http.get<AdminRequestListResponse>(base, { params });
    },

    show(id: string) {
      return http.get<AdminRequestSingleResponse>(`${base}/${id}`);
    },

    create(payload: AdminRequestCreatePayload) {
      return http.post<AdminRequestSingleResponse>(base, payload);
    },

    cancel(id: string) {
      return http.post<AdminRequestSingleResponse>(`${base}/${id}/cancel`);
    },

    approve(id: string, comment?: string) {
      return http.post<AdminRequestSingleResponse>(
        `${base}/${id}/approve`,
        comment ? { comment } : {},
      );
    },

    reject(id: string, comment?: string) {
      return http.post<AdminRequestSingleResponse>(
        `${base}/${id}/reject`,
        comment ? { comment } : {},
      );
    },
  };
}

export const pmAdminRequestsApi  = createAdminRequestsApi('pm');
export const seoAdminRequestsApi = createAdminRequestsApi('seo');

export function adminRequestsApiFor(ns: AdminRequestNamespace) {
  return ns === 'pm' ? pmAdminRequestsApi : seoAdminRequestsApi;
}
