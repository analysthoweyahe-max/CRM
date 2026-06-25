export type LeaveStatus = 'pending' | 'approved' | 'rejected';

/* ── Frontend display record (kept for legacy compat) ── */
export interface LeaveRequest {
  id:             string;
  empId:          string;
  empNameAr:      string;
  empNameEn:      string;
  empDeptAr:      string;
  empDeptEn:      string;
  empJobTitleAr:  string;
  empJobTitleEn:  string;
  empInitial:     string;
  empAvatarBg:    string;
  leaveTypeAr:    string;
  leaveTypeEn:    string;
  from:           string;
  to:             string;
  durationAr:     string;
  durationEn:     string;
  requestDate:    string;
  status:         LeaveStatus;
  reason:         string;
  approvalDate?:  string;
  notes?:         string;
  rejectionReason?: string;
  attachment?:    { nameAr: string; nameEn: string; sizeKB: number };
}

/* ── API types ── */

export interface ApiLeaveEmployee {
  id:        string;
  name:      string;
  number?:   string;
  department: string;
  job_title:  string;
}

export interface ApiLeaveAttachment {
  name: string;
  size: number;
  url:  string;
}

export interface ApiLeaveRequest {
  id:               string;
  employee:         ApiLeaveEmployee;
  leave_type:       string;
  leave_type_label: string;
  start_date:       string;
  end_date:         string;
  days_count:       number;
  request_date:     string;
  status:           LeaveStatus;
  reason:           string;
  rejection_reason?: string;
  notes?:           string;
  approved_at?:     string;
  attachment?:      ApiLeaveAttachment;
}

export interface LeaveListCounts {
  all:      number;
  pending:  number;
  approved: number;
  rejected: number;
}

export interface LeaveListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiLeaveRequest[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
    counts?:      LeaveListCounts;
  };
}

export interface LeaveSingleResponse {
  status:  string;
  message: string;
  data:    ApiLeaveRequest;
}

export interface LeaveTypeItem {
  key:      string;
  label:    string;
  label_ar?: string;
}

export interface LeaveTypesResponse {
  status:  string;
  message: string;
  data:    LeaveTypeItem[];
}

export interface LeaveListParams {
  status?:       LeaveStatus | '';
  leave_type?:   string;
  search?:       string;
  request_date?: string;
  per_page?:     number;
  page?:         number;
}

export interface EmployeeLeaveSummary {
  annual_balance: number;
  used:           number;
  remaining:      number;
}

export interface EmployeeLeaveSummaryResponse {
  status:  string;
  message: string;
  data:    EmployeeLeaveSummary;
}

export interface EmployeeLeaveHistoryParams {
  status?:     LeaveStatus | '';
  leave_type?: string;
  per_page?:   number;
  page?:       number;
}

export interface EmployeeLeaveHistoryResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiLeaveRequest[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
  };
}
