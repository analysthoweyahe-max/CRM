export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveStatusCfg {
  bgCls:   string;
  textCls: string;
  dotCls:  string;
  labelAr: string;
  labelEn: string;
}

export const LEAVE_STATUS_CFG: Record<LeaveStatus, LeaveStatusCfg> = {
  pending:  { bgCls: 'bg-yellow-100 dark:bg-yellow-900/30', textCls: 'text-yellow-700 dark:text-yellow-400', dotCls: 'bg-yellow-500', labelAr: 'معلقة',      labelEn: 'Pending'  },
  approved: { bgCls: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10',  textCls: 'text-[#709028] dark:text-[#A0CD39]',   dotCls: 'bg-[#709028]', labelAr: 'موافق عليها', labelEn: 'Approved' },
  rejected: { bgCls: 'bg-red-100 dark:bg-red-900/20',       textCls: 'text-red-600 dark:text-red-400',        dotCls: 'bg-red-500',   labelAr: 'مرفوضة',     labelEn: 'Rejected' },
};

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
  employee?:        ApiLeaveEmployee | null;
  /* flat fallbacks some API versions return instead of the nested object */
  employee_name?:   string;
  employee_department?: string;
  employee_job_title?:  string;
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
  with?:         string;
}

export interface EmployeeLeaveBalance {
  leaveType:      string;
  leaveTypeLabel: string;
  entitled:       number;
  used:           number;
  remaining:      number;
}

/** New shape from GET /v1/hr/employees/{id}/leave/summary */
export interface EmployeeLeaveSummaryV2 {
  balances: EmployeeLeaveBalance[];
  requests?: unknown[];
  viewFullHistoryUrl?: string;
}

/** Legacy flat shape (kept for backward compatibility) */
export interface EmployeeLeaveSummaryLegacy {
  annual_balance: number;
  used:           number;
  remaining:      number;
}

export type EmployeeLeaveSummary = EmployeeLeaveSummaryV2 | EmployeeLeaveSummaryLegacy;

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

/* ── LeavesPage types ── */

export type FilterTab = 'all' | LeaveStatus;

export interface LeavesTab {
  key:     FilterTab;
  labelAr: string;
  labelEn: string;
}

export interface UseLeavesPageReturn {
  isLoading:          boolean;
  activeFilter:       FilterTab;
  search:             string;
  page:               number;
  counts:             LeaveListCounts;
  rows:               ApiLeaveRequest[];
  total:              number;
  lastPage:           number;
  firstRow:           number;
  lastRow:            number;
  setPage:            (p: number) => void;
  handleFilterChange: (tab: FilterTab) => void;
  handleSearchChange: (v: string) => void;
}

export const LEAVES_TABS: LeavesTab[] = [
  { key: 'all',      labelAr: 'كل الطلبات',  labelEn: 'All'      },
  { key: 'pending',  labelAr: 'معلقة',        labelEn: 'Pending'  },
  { key: 'approved', labelAr: 'موافق عليها',  labelEn: 'Approved' },
  { key: 'rejected', labelAr: 'مرفوضة',       labelEn: 'Rejected' },
];

export const COLS_AR = ['الموظف', 'نوع الإجازة', 'من', 'إلى', 'المدة', 'تاريخ الطلب', 'الحالة', 'إجراءات'];
export const COLS_EN = ['Employee', 'Type', 'From', 'To', 'Duration', 'Request Date', 'Status', 'Actions'];

/* ── LeaveDetailPage types ── */

export interface FieldProps {
  label: string;
  value: string;
}

export interface UseLeaveDetailPageReturn {
  id:              string | undefined;
  isAr:            boolean;
  req:             ApiLeaveRequest | undefined;
  isLoading:       boolean;
  isError:         boolean;
  name:            string;
  initial:         string;
  avatarBg:        string;
  daysLabel:       string;
  approveOpen:     boolean;
  rejectOpen:      boolean;
  approveNote:     string;
  rejectReason:    string;
  rejectError:     boolean;
  isActionPending: boolean;
  setApproveOpen:  (v: boolean) => void;
  setRejectOpen:   (v: boolean) => void;
  setApproveNote:  (v: string) => void;
  setRejectReason: (v: string) => void;
  setRejectError:  (v: boolean) => void;
  handleApprove:   () => void;
  handleReject:    () => void;
}
