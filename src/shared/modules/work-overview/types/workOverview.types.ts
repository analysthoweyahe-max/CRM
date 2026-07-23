import type { AttendanceScope } from '@/shared/modules/attendance/types/attendanceTimer.types';

export type WorkScope = AttendanceScope;

export interface WorkOverviewEmployee {
  id:             string;
  name:           string;
  employeeNumber: string;
  /** ISO currency code (EGP | USD | EUR | SAR | AED | GBP | QAR | KWD). Null → display as EGP. */
  currency:       string | null;
}

export interface WorkedDay {
  date:           string;
  checkInTime:    string | null;
  checkOutTime:   string | null;
  workingHours:   number | null;
  dayStatus:      string;
  dayStatusLabel: string;
}

export interface WorkOverviewAttendance {
  month:           string;
  presentDays:     number;
  absentDays:      number;
  lateCount:       number;
  overtimeCount?:  number;
  totalWorkHours:  number;
  workedDays:      WorkedDay[];
}

export interface WorkOverviewTotals {
  count:       number;
  totalAmount: number | null;
}

export interface WorkOverviewSalary {
  financialMonth: string;
  basicSalary:    number | null;
  deductions:     number | null;
  rewards:        number | null;
  overtime:       number | null;
  bonus:          number | null;
  netSalary:      number | null;
  /** Same ISO code as employee.currency; null → display as EGP. */
  currency:       string | null;
}

export interface WorkOverviewLinks {
  attendanceHistory: string;
  attendanceSummary: string;
  deductions:        string;
  bonuses:           string;
}

export interface WorkOverviewData {
  employee:   WorkOverviewEmployee;
  month:      string;
  attendance: WorkOverviewAttendance;
  deductions: WorkOverviewTotals;
  bonuses:    WorkOverviewTotals;
  salary?:    WorkOverviewSalary;
  links:      WorkOverviewLinks;
}

export interface WorkOverviewResponse {
  status:  string;
  message: string;
  data:    WorkOverviewData;
}

export interface PersonalDeduction {
  id:                 string;
  amount:             number | null;
  deductionType?:     string;
  deductionTypeLabel?: string;
  type?:              { id?: string; code?: string; label?: string; source?: string } | null;
  source?:            string;
  sourceLabel?:       string;
  reason:             string;
  deductionDate:      string;
  financialMonth:     string;
  status?:            string;
  statusLabel?:       string;
  notes?:             string | null;
}

export interface PersonalBonus {
  id:                   string;
  amount:               number | null;
  adjustmentType?:      string;
  adjustmentTypeLabel?: string;
  type?:                { id?: string; code?: string; label?: string; source?: string } | null;
  reason:               string;
  adjustmentDate:       string;
  financialMonth:       string;
  overtimeHours?:       number | null;
  status?:              string;
  statusLabel?:         string;
  notes?:               string | null;
}

export interface PersonalPaginated<T> {
  data:         T[];
  current_page: number;
  last_page:    number;
  total:        number;
  per_page?:    number;
}

export interface PersonalDeductionListResponse {
  status:  string;
  message: string;
  data:    PersonalPaginated<PersonalDeduction>;
}

export interface PersonalDeductionDetailResponse {
  status:  string;
  message: string;
  data:    PersonalDeduction;
}

export interface PersonalBonusListResponse {
  status:  string;
  message: string;
  data:    PersonalPaginated<PersonalBonus>;
}

export interface PersonalBonusDetailResponse {
  status:  string;
  message: string;
  data:    PersonalBonus;
}

export interface PersonalDeductionListParams {
  financial_month?: string;
  status?:          string;
  per_page?:        number;
  page?:            number;
}

export interface PersonalBonusListParams {
  financial_month?: string;
  adjustment_type?: string;
  date_from?:       string;
  date_to?:         string;
  per_page?:        number;
  page?:            number;
}

export interface WorkAppRoutes {
  overview:         string;
  attendance:       string;
  deductions:       string;
  deductionDetail:  (id: string) => string;
  bonuses:          string;
  bonusDetail:      (id: string) => string;
}
