export type AdminRequestNamespace = 'pm' | 'seo';

export type AdminRequestType = 'leave' | 'permission' | 'support' | 'other';

export type AdminRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AdminRequestTypeOption {
  value: string;
  label: string;
}

export interface AdminRequestEmployee {
  id:            string;
  name:          string;
  department:    string;
  avatarInitial: string;
}

export interface AdminRequestActions {
  canApprove: boolean;
  canReject:  boolean;
  canCancel:  boolean;
  approveUrl: string | null;
  rejectUrl:  string | null;
  cancelUrl:  string | null;
}

export interface AdminRequest {
  id:               string;
  requestType:      AdminRequestType | string;
  requestTypeLabel: string;
  title:            string;
  description:      string | null;
  requestDate:      string | null;
  startDate:        string | null;
  endDate:          string | null;
  submittedAt:      string;
  status:           AdminRequestStatus;
  statusLabel:      string;
  reviewerComment:  string | null;
  reviewedAt:       string | null;
  employee:         AdminRequestEmployee;
  actions:          AdminRequestActions;
}

export interface AdminRequestCreatePayload {
  request_type: AdminRequestType | string;
  title:        string;
  description?: string;
  request_date?: string;
  start_date?:  string;
  end_date?:    string;
}

export interface AdminRequestListParams {
  status?:      AdminRequestStatus | '';
  request_type?: AdminRequestType | string;
  search?:      string;
  employee_id?: string;
  from_date?:   string;
  to_date?:     string;
  per_page?:    number;
  page?:        number;
}

export interface AdminRequestListResponse {
  status:  string;
  message: string;
  data: {
    data:         AdminRequest[];
    current_page: number;
    last_page:    number;
    total:        number;
    statusCounts?: {
      all:      number;
      pending:  number;
      approved: number;
      rejected: number;
      cancelled?: number;
    };
  };
}

export interface AdminRequestSingleResponse {
  status:  string;
  message: string;
  data:    AdminRequest;
}

export interface AdminRequestTypesResponse {
  status:  string;
  message: string;
  data:    AdminRequestTypeOption[];
}

export const ADMIN_REQUEST_STATUS_MAP: Record<
  AdminRequestStatus,
  { ar: string; en: string; variant: 'success' | 'error' | 'warning' | 'gray' }
> = {
  pending:   { ar: 'قيد المراجعة', en: 'Under Review', variant: 'warning' },
  approved:  { ar: 'موافق عليه',   en: 'Approved',     variant: 'success' },
  rejected:  { ar: 'مرفوض',        en: 'Rejected',     variant: 'error'   },
  cancelled: { ar: 'ملغى',         en: 'Cancelled',    variant: 'gray'    },
};

export const ADMIN_REQUEST_TYPE_LABELS: Record<AdminRequestType, { ar: string; en: string }> = {
  leave:      { ar: 'إجازة',  en: 'Leave' },
  permission: { ar: 'إذن',    en: 'Permission' },
  support:    { ar: 'دعم',    en: 'Support' },
  other:      { ar: 'أخرى',   en: 'Other' },
};
