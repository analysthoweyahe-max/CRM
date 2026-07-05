import { http } from '@/shared/services/http.service';

export interface RawPmRequestEmployee {
  id:            string;
  name:          string;
  department:    string;
  avatarInitial: string;
}

export interface RawPmRequestActions {
  canApprove: boolean;
  canReject:  boolean;
  approveUrl: string | null;
  rejectUrl:  string | null;
}

export interface RawPmRequest {
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
  employee:         RawPmRequestEmployee;
  actions:          RawPmRequestActions;
}

export interface PmRequestListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawPmRequest[];
    current_page: number;
    last_page:    number;
    total:        number;
    statusCounts: { all: number; pending: number; approved: number; rejected: number };
  };
}

export const pmRequestsApi = {
  list(params?: { status?: string; search?: string; per_page?: number }) {
    return http.get<PmRequestListResponse>('/v1/pm/requests', { params });
  },

  approve(id: string, comment?: string) {
    return http.post(`/v1/pm/requests/${id}/approve`, comment ? { comment } : {});
  },

  reject(id: string, comment?: string) {
    return http.post(`/v1/pm/requests/${id}/reject`, comment ? { comment } : {});
  },
};
