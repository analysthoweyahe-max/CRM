export type SeoLeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface SeoLeaveType {
  value: string;
  label: string;
  tracksBalance: boolean;
}

export interface SeoLeavePeriod {
  startDate: string;
  endDate: string;
  daysCount: number;
}

export interface SeoLeaveRequest {
  id: string;
  leaveType: string;
  leaveTypeLabel: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: SeoLeaveStatus;
  statusLabel: string;
  requestDate: string;
  period?: SeoLeavePeriod;
  /** HR rejection / review notes (present when rejected) */
  hrNotes?: string | null;
  rejectionReason?: string | null;
  viewDetailsUrl?: string;
}

export interface SeoLeaveBalance {
  leaveType: string;
  leaveTypeLabel: string;
  entitled: number;
  used: number;
  remaining: number;
}

export interface SeoLeaveSummary {
  balances: SeoLeaveBalance[];
  requests: SeoLeaveRequest[];
  viewFullHistoryUrl: string;
}

// ── API response envelopes ───────────────────────────────────────────────────

export interface SeoLeaveTypesResponse {
  status: string;
  message: string;
  data: SeoLeaveType[];
}

export interface SeoLeaveSummaryResponse {
  status: string;
  message: string;
  data: SeoLeaveSummary;
}

export interface SeoLeaveHistoryResponse {
  status: string;
  message: string;
  data: {
    data: SeoLeaveRequest[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface SeoLeaveCreateResponse {
  status: string;
  message: string;
  data: SeoLeaveRequest;
}

// ── Form payload ─────────────────────────────────────────────────────────────

export interface SeoLeaveCreatePayload {
  leave_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  attachment?: File;
}
