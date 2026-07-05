import { http } from '@/shared/services/http.service';

/* Response shape mirrored from the identical, already-confirmed GET /v1/pm/requests
 * contract (same backend convention: requestType/requestTypeLabel, employee,
 * actions, statusCounts). Verify against a real response and adjust if it differs. */
export interface RawSeoRequestEmployee {
  id:            string;
  name:          string;
  department:    string;
  avatarInitial: string;
}

export interface RawSeoRequestActions {
  canApprove: boolean;
  canReject:  boolean;
  approveUrl: string | null;
  rejectUrl:  string | null;
}

export interface RawSeoRequest {
  id:               string;
  requestType:      string;
  requestTypeLabel: string;
  title:            string;
  description:      string | null;
  requestDate:      string;
  startDate:        string;
  endDate:          string;
  submittedAt:      string;
  status:           'pending' | 'approved' | 'rejected';
  statusLabel:      string;
  reviewerComment:  string | null;
  reviewedAt:       string | null;
  employee:         RawSeoRequestEmployee;
  actions:          RawSeoRequestActions;
}

export interface SeoRequestListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawSeoRequest[];
    current_page: number;
    last_page:    number;
    total:        number;
    statusCounts: { all: number; pending: number; approved: number; rejected: number };
  };
}

export const seoRequestsApi = {
  list(params?: { status?: string; search?: string; per_page?: number }) {
    return http.get<SeoRequestListResponse>('/v1/seo/requests', { params });
  },

  approve(id: string, comment?: string) {
    return http.post(`/v1/seo/requests/${id}/approve`, comment ? { comment } : {});
  },

  reject(id: string, comment?: string) {
    return http.post(`/v1/seo/requests/${id}/reject`, comment ? { comment } : {});
  },
};
