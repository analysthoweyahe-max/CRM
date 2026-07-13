export type DayStatus =
  | 'present' | 'late' | 'absent' | 'leave'
  | 'normal_day' | 'late_arrival' | 'early_leave' | 'overtime' | 'awaiting_check_in';
export type WorkStatus = 'working' | 'done' | 'not_started' | 'offline';

/** AttendanceDayStatus enum (Modules/HR/app/Enums/AttendanceDayStatus.php) — filter/response values for /v1/hr/attendance/daily */
export type DailyDayStatus = 'normal' | 'late_arrival' | 'overtime' | 'absent' | 'awaiting_check_in';
/** WorkStatus enum (Modules/HR/app/Enums/WorkStatus.php) — filter/response values for /v1/hr/attendance/daily */
export type DailyWorkStatus = 'currently_working' | 'on_break' | 'offline';

/* ── Frontend display record (used by table + stats) ── */
export interface AttendanceRecord {
  id:          string;
  employeeId:  string;
  name:        string;
  initial:     string;
  avatarColor: string;
  department:  string;
  checkIn:     string | null;
  checkOut:    string | null;
  workedHours: number | null;
  dayStatus:   DailyDayStatus;
  dayStatusLabel?: string;
  workStatus:  DailyWorkStatus;
  workStatusLabel?: string;
}

/* ── API: daily attendance (/v1/hr/attendance/daily) ── */
export interface ApiDailyRecord {
  employeeId:      string;
  employeeNumber:  string;
  employeeName:    string;
  department:      string;
  departmentId:    number;
  checkInTime:     string | null;
  checkOutTime:    string | null;
  workingHours:    number | null;
  dayStatus:       DailyDayStatus;
  dayStatusLabel:  string;
  workStatus:      DailyWorkStatus;
  workStatusLabel: string;
}

export interface DailyAttendanceSummary {
  checkedIn:        number;
  currentlyWorking: number;
  lateArrivals:     number;
  absentToday:      number;
}

export interface DailyAttendanceResponse {
  status:  string;
  message: string;
  data: {
    date:         string;
    summary:      DailyAttendanceSummary;
    data:         ApiDailyRecord[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface DailyAttendanceParams {
  search?:        string;
  department_id?: string | number;
  day_status?:    DailyDayStatus | '';
  work_status?:   DailyWorkStatus | '';
  per_page?:      number;
  page?:          number;
}

/* ── API: employee attendance record ── */
export interface ApiEmployeeAttendanceRecord {
  id:              string | number;
  date:            string;
  check_in?:       string | null;
  check_out?:      string | null;
  checkInTime?:    string | null;
  checkOutTime?:   string | null;
  worked_hours?:   number | null;
  workingHours?:   number | null;
  day_status?:     DayStatus;
  dayStatus?:      DayStatus;
  dayStatusLabel?: string;
}

export interface AttendanceRecentResponse {
  status:  string;
  message: string;
  data:    ApiEmployeeAttendanceRecord[];
}

export interface AttendanceHistoryResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiEmployeeAttendanceRecord[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
  };
}

export interface AttendanceHistoryParams {
  month?:     string;
  date_from?: string;
  date_to?:   string;
  per_page?:  number;
  page?:      number;
}

/** Row shown in the multi-employee attendance log table */
export interface AttendanceLogRow {
  id:              string;
  date:            string;
  employeeId:      string;
  name:            string;
  initial:         string;
  avatarColor:     string;
  department:      string;
  check_in:        string | null;
  check_out:       string | null;
  worked_hours:    number | null;
  day_status:      DayStatus | '';
  day_status_label?: string;
}

/* ── Employee self-service attendance ── */

export interface AttendanceStatusFlag {
  value: string;
  label: string;
}

/** Shape returned by today / check-in / check-out endpoints */
export interface EmployeeAttendanceRecord {
  id?:           string;
  date?:         string;          // "YYYY-MM-DD"
  checkInTime?:  string | null;   // "HH:MM:SS"  — null if not checked in yet
  checkOutTime?: string | null;   // "HH:MM:SS"  — null while still working
  workingHours?: number | null;
  statusFlags?:  AttendanceStatusFlag[];
  createdAt?:    string;
  updatedAt?:    string;
}

export interface EmployeeTodayAttendanceResponse {
  status:  string;
  message: string;
  data:    EmployeeAttendanceRecord;
}

export interface EmployeeCheckInResponse {
  status:  string;
  message: string;
  data:    EmployeeAttendanceRecord;
}

export interface EmployeeCheckOutResponse {
  status:  string;
  message: string;
  data:    EmployeeAttendanceRecord;
}

export interface EmployeeSelfHistoryParams {
  month?:     string;
  date_from?: string;
  date_to?:   string;
  per_page?:  number;
  page?:      number;
}
