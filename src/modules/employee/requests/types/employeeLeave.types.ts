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
  type?:      string;
  label?:     string;
  typeLabel?: string;
  balance?:   number;
  total?:     number;
  used?:      number;
  remaining?: number;
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
  status: string;
  data:   EmpLeaveSummaryItem[] | Record<string, unknown>;
}

export interface EmpLeaveCreateResponse {
  status:  string;
  message: string;
  data:    EmpLeaveRequest;
}
