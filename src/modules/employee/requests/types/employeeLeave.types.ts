export type EmpLeaveStatus = 'pending' | 'approved' | 'rejected';

export interface EmpLeaveType {
  id:      string;
  name?:   string;
  nameAr?: string;
  nameEn?: string;
  label?:  string;
}

export interface EmpLeaveRequest {
  id:               string;
  uuid?:            string;
  type?:            EmpLeaveType | string;
  typeLabel?:       string;
  description?:     string;
  reason?:          string;
  date?:            string;
  start_date?:      string;
  end_date?:        string;
  status:           EmpLeaveStatus;
  manager_comment?: string;
  attachment?:      string;
  created_at?:      string;
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
    data: EmpLeaveRequest[];
  };
}

export interface EmpLeaveSummaryResponse {
  status:  string;
  message: string;
  data: {
    balances:            EmpLeaveSummaryItem[];
    requests:            unknown[];
    viewFullHistoryUrl?: string;
  };
}

export interface EmpLeaveCreateResponse {
  status:  string;
  message: string;
  data:    EmpLeaveRequest;
}
