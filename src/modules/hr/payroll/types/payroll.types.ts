/* ── Deduction ─────────────────────────────────────────────── */

export type DeductionSource = 'auto' | 'manual';
export type DeductionStatus = string;

export interface ApiCreatedBy {
  id:   string;
  name: string;
}

export interface ApiDeduction {
  id:                   string;
  employeeNumber:       string;
  employeeName:         string;
  employeeId:           string;
  department:           string;
  source:               DeductionSource;
  sourceLabel:          string;
  deductionType:        string;
  deductionTypeLabel:   string;
  amount:               number;
  reason:               string;
  notes:                string | null;
  deductionDate:        string;
  financialMonth:       string;
  status:               DeductionStatus;
  statusLabel:          string;
  createdBy:            ApiCreatedBy;
  statusUpdatedAt:      string | null;
  createdAt:            string;
  updatedAt:            string;
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
  value: string;
  label: string;
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
  employee_number:  string;
  deduction_type?:  string;
  financial_month?: string;
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

/* ── Bonuses ────────────────────────────────────────────────── */

export interface ApiBonus {
  id:                    string;
  employeeNumber:        string;
  employeeName:          string;
  employeeId:            string;
  department:            string;
  source:                'auto' | 'manual';
  sourceLabel:           string;
  adjustmentType:        string;
  adjustmentTypeLabel:   string;
  amount:                number;
  reason:                string;
  notes:                 string | null;
  adjustmentDate:        string;
  financialMonth:        string;
  overtimeHours:         number | null;
  hourlyRate:            number | null;
  rateMultiplier:        number | null;
  createdBy:             ApiCreatedBy;
  createdAt:             string;
  updatedAt:             string;
}

export interface BonusListSummary {
  total_amount: number;
  auto_count:   number;
  manual_count: number;
}

export interface BonusListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiBonus[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
    summary?:     BonusListSummary;
  };
}

export interface BonusSingleResponse {
  status:  string;
  message: string;
  data:    ApiBonus;
}

export interface BonusListParams {
  adjustment_type?: string;
  department_id?:   string;
  date_from?:       string;
  date_to?:         string;
  search?:          string;
  per_page?:        number;
  page?:            number;
}

export interface BonusLookupItem {
  value: string;
  label: string;
}

export interface BonusLookupResponse {
  status:  string;
  message: string;
  data:    BonusLookupItem[];
}

export interface OvertimeSettingsData {
  enabled:           boolean;
  thresholdMinutes:  number;
  rateMultiplier:    number;
  monthlyWorkHours:  number;
}

export interface OvertimeSettingsResponse {
  status:  string;
  message: string;
  data:    OvertimeSettingsData;
}

/* Write payload — unconfirmed exact keys (no sample PUT seen yet), snake_case
 * chosen to match every other confirmed write endpoint in this app. Verify
 * against a real save and adjust if the backend rejects it. */
export interface UpdateOvertimeSettingsPayload {
  enabled?:            boolean;
  threshold_minutes?:  number;
  rate_multiplier?:    number;
  monthly_work_hours?: number;
}

export interface OvertimeProcessResponse {
  status:  string;
  message: string;
  data: {
    count:   number;
    records: unknown[];
  };
}

export interface CreateBonusPayload {
  employee_number: string;
  adjustment_type: string;
  financial_month: string;
  amount:          number;
  reason:          string;
  notes?:          string;
}

export interface EmployeeBonusListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiBonus[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
  };
}
