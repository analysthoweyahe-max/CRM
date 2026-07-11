export type ExceptionRequestType = 'early_start' | 'late_start' | 'overtime';
export type ExceptionStatus      = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ExceptionEmployee {
  id:             string;
  employeeNumber: string;
  name:           string;
  department:     string;
}

export interface ExceptionReviewer {
  id:   string;
  name: string;
}

export interface AttendanceException {
  id:              string;
  workDate:        string;
  requestType:     ExceptionRequestType;
  requestTypeLabel: string;
  reason:          string;
  status:          ExceptionStatus;
  statusLabel:     string;
  reviewedAt:      string | null;
  rejectionReason: string | null;
  createdAt:       string;
  employee?:       ExceptionEmployee;
  reviewer?:       ExceptionReviewer | null;
}

export interface ExceptionListResponse {
  status:  string;
  message: string;
  data: {
    data:         AttendanceException[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page?:    number;
  };
}

export interface ExceptionSingleResponse {
  status:  string;
  message: string;
  data:    AttendanceException;
}

export interface CreateExceptionPayload {
  work_date:    string;
  request_type: ExceptionRequestType;
  reason:       string;
}

/** HR / super-admin — create on behalf of an employee */
export interface HrCreateExceptionPayload extends CreateExceptionPayload {
  employee_id: string;
}

export interface RejectExceptionPayload {
  rejection_reason: string;
}

export interface ExceptionListParams {
  status?:       ExceptionStatus | '';
  request_type?: ExceptionRequestType | '';
  search?:       string;
  per_page?:     number;
  page?:         number;
}

export const EXCEPTION_TYPE_LABELS: Record<ExceptionRequestType, { ar: string; en: string }> = {
  early_start: { ar: 'بدء مبكر',  en: 'Early Start' },
  late_start:  { ar: 'بدء متأخر', en: 'Late Start'  },
  overtime:    { ar: 'عمل إضافي', en: 'Overtime'    },
};

export const EXCEPTION_STATUS_CFG: Record<ExceptionStatus, { ar: string; en: string; variant: 'warning' | 'success' | 'error' | 'neutral' }> = {
  pending:   { ar: 'معلقة',  en: 'Pending',   variant: 'warning' },
  approved:  { ar: 'موافق',  en: 'Approved',  variant: 'success' },
  rejected:  { ar: 'مرفوض',  en: 'Rejected',  variant: 'error'   },
  cancelled: { ar: 'ملغاة',  en: 'Cancelled', variant: 'neutral' },
};
