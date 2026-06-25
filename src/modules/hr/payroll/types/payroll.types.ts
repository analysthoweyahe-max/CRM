/* ── Deduction ─────────────────────────────────────────────── */

export type DeductionSource = 'auto' | 'manual';
export type DeductionStatus = 'active' | 'cancelled' | 'pending';

export interface ApiDeductionEmployee {
  id:               string;
  name:             string;
  employee_number?: string;
  department?:      string;
}

export interface ApiDeduction {
  id:                   string;
  employee:             ApiDeductionEmployee;
  deduction_type:       string;
  deduction_type_label: string;
  amount:               number;
  reason:               string;
  notes?:               string;
  date?:                string;
  financial_month:      string;
  source:               DeductionSource;
  source_label?:        string;
  status:               DeductionStatus;
}

export interface DeductionListSummary {
  total_amount: number;
  auto_count:   number;
  manual_count: number;
}

export interface DeductionListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiDeduction[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
    summary?:     DeductionListSummary;
  };
}

export interface DeductionSingleResponse {
  status:  string;
  message: string;
  data:    ApiDeduction;
}

export interface DeductionListParams {
  status?:          string;
  source?:          string;
  deduction_type?:  string;
  financial_month?: string;
  department_id?:   string | number;
  search?:          string;
  per_page?:        number;
  page?:            number;
}

export interface DeductionLookupItem {
  key:       string;
  label:     string;
  label_ar?: string;
}

export interface DeductionLookupResponse {
  status:  string;
  message: string;
  data:    DeductionLookupItem[];
}

export interface DeductionEmployeeLookup {
  id:               string;
  name:             string;
  employee_number?: string;
  department?:      string;
}

export interface DeductionEmployeeLookupResponse {
  status:  string;
  message: string;
  data:    DeductionEmployeeLookup | null;
}

export interface CreateDeductionPayload {
  employee_id:      string;
  deduction_type:   string;
  financial_month:  string;
  amount:           number;
  reason:           string;
  notes?:           string;
}

export interface UpdateDeductionStatusPayload {
  status: DeductionStatus;
}

export interface EmployeeDeductionListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiDeduction[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
  };
}
