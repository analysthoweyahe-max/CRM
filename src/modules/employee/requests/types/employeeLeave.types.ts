export type EmpLeaveStatus = 'pending' | 'approved' | 'rejected';

export interface EmpLeaveType {
  value:         string;
  label:         string;
  tracksBalance: boolean;
}

export interface EmpLeavePeriod {
  startDate: string;
  endDate:   string;
  daysCount: number;
}

export interface EmpLeaveRequest {
  id:              string;
  leaveType:       string;
  leaveTypeLabel:  string;
  startDate:       string;
  endDate:         string;
  daysCount:       number;
  reason:          string;
  status:          EmpLeaveStatus;
  statusLabel:     string;
  requestDate:     string;
  period:          EmpLeavePeriod;
  viewDetailsUrl?: string;
}

export interface EmpLeaveDetail extends EmpLeaveRequest {
  content:            string | null;
  durationLabel:      string;
  requestSubmittedAt: string;
  approvedAt:         string | null;
  rejectedAt:         string | null;
  rejectionReason:    string | null;
  attachments:        unknown[];
  employee: {
    id:             string;
    employeeNumber: string;
    name:           string;
    department:     string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmpLeaveSummaryItem {
  leaveType:      string;
  leaveTypeLabel: string;
  entitled:       number;
  used:           number;
  remaining:      number;
}

export interface EmpLeaveTypesResponse {
  status: string;
  data:   EmpLeaveType[];
}

export interface EmpLeaveListResponse {
  status: string;
  data: {
    data:         EmpLeaveRequest[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface EmpLeaveSummaryResponse {
  status:  string;
  message: string;
  data: {
    balances:            EmpLeaveSummaryItem[];
    requests:            EmpLeaveRequest[];
    viewFullHistoryUrl?: string;
  };
}

export interface EmpLeaveCreatePayload {
  leave_type: string;
  start_date: string;
  end_date:   string;
  reason:     string;
  content?:   string;
}

export interface EmpLeaveDetailResponse {
  status:  string;
  message: string;
  data:    EmpLeaveDetail;
}

export interface EmpLeaveCreateResponse {
  status:  string;
  message: string;
  data:    EmpLeaveRequest;
}
