/* ── Deduction ─────────────────────────────────────────────── */

export type DeductionSource = 'auto' | 'manual';
export type DeductionStatus = string;

export interface ApiCreatedBy {
  id:   string;
  name: string;
}

export interface PayrollTypeRef {
  id:     string;
  code:   string;
  label:  string;
  source: 'manual' | 'automatic' | string;
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
  type?:                PayrollTypeRef | null;
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

export interface PayrollTypeLookupItem {
  id:          string;
  code:        string;
  value:       string;
  name:        string;
  nameAr:      string;
  label:       string;
  source:      'manual' | 'automatic' | string;
  sourceLabel: string;
  isActive:    boolean;
  isSystem:    boolean;
  sortOrder:   number;
}

/** @deprecated Prefer PayrollTypeLookupItem — kept for source lookups */
export interface DeductionLookupItem {
  value: string;
  label: string;
  id?:   string;
  code?: string;
  name?: string;
  nameAr?: string;
}

export interface DeductionLookupResponse {
  status:  string;
  message: string;
  data:    DeductionLookupItem[];
}

export interface PayrollTypeLookupResponse {
  status:  string;
  message: string;
  data:    PayrollTypeLookupItem[];
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
  employee_number:     string;
  deduction_type_id?:  string;
  deduction_type?:     string;
  financial_month?:    string;
  amount:              number;
  reason:              string;
  notes?:              string;
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
  type?:                 PayrollTypeRef | null;
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

export type BonusLookupItem = PayrollTypeLookupItem;

export interface BonusLookupResponse {
  status:  string;
  message: string;
  data:    PayrollTypeLookupItem[];
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

export interface UpdateOvertimeSettingsPayload {
  enabled:           boolean;
  thresholdMinutes:  number;
  rateMultiplier:    number;
  monthlyWorkHours:  number;
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
  employee_number:  string;
  bonus_type_id?:   string;
  adjustment_type?: string;
  financial_month:  string;
  amount:           number;
  reason:           string;
  notes?:           string;
}

/* ── Bonus / Deduction Types (CRUD) ─────────────────────────── */

export type PayrollTypeSource = 'manual' | 'automatic';

export interface ApiPayrollAdjustmentType {
  id:          string;
  code:        string;
  name:        string;
  nameAr:      string | null;
  label:       string;
  source:      PayrollTypeSource | string;
  sourceLabel: string;
  isActive:    boolean;
  isSystem:    boolean;
  sortOrder:   number;
  createdAt?:  string;
  updatedAt?:  string;
}

export interface PayrollTypeListResponse {
  status:  string;
  message: string;
  data:    ApiPayrollAdjustmentType[] | {
    data:         ApiPayrollAdjustmentType[];
    current_page?: number;
    last_page?:    number;
    total?:        number;
  };
}

export interface PayrollTypeSingleResponse {
  status:  string;
  message: string;
  data:    ApiPayrollAdjustmentType;
}

export interface CreatePayrollTypePayload {
  code?:       string;
  name:        string;
  name_ar?:    string;
  source?:     PayrollTypeSource;
  is_active?:  boolean;
  sort_order?: number;
}

export type UpdatePayrollTypePayload = CreatePayrollTypePayload;

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

/* ── Salary Sheet ───────────────────────────────────────────── */

export interface ApiSalaryRow {
  id:             string;
  employeeNumber: string;
  name:           string;
  department:     string;
  departmentId:   number | null;
  financialMonth: string;
  basicSalary:    number;
  deductions:     number;
  rewards:        number;
  overtime:       number;
  bonus:          number;
  netSalary:      number;
}

export interface SalarySheetTotals {
  basicSalary: number;
  deductions:  number;
  rewards:     number;
  overtime:    number;
  bonus:       number;
  netSalary:   number;
}

export interface SalarySheetSummary {
  financialMonth: string;
  employeeCount:  number;
  totals:         SalarySheetTotals;
}

export interface SalaryListParams {
  financial_month?: string;
  department_id?:   string | number;
  search?:          string;
  /** Specific employees — sent as employee_ids[] */
  employee_ids?:    string[];
  per_page?:        number;
  page?:            number;
}

export interface SalaryListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiSalaryRow[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page?:    number;
    summary:      SalarySheetSummary;
  };
}

export interface SalarySummaryResponse {
  status:  string;
  message: string;
  data:    SalarySheetSummary;
}

