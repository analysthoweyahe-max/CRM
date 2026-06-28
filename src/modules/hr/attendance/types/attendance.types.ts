export type DayStatus  = 'present' | 'late' | 'absent' | 'leave';
export type WorkStatus = 'working' | 'done' | 'not_started' | 'offline';

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
  dayStatus:   DayStatus;
  workStatus:  WorkStatus;
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
  dayStatus:       DayStatus;
  dayStatusLabel:  string;
  workStatus:      WorkStatus;
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
  day_status?:    DayStatus | '';
  work_status?:   WorkStatus | '';
  per_page?:      number;
  page?:          number;
}

/* ── API: employee attendance record ── */
export interface ApiEmployeeAttendanceRecord {
  id:           string | number;
  date:         string;
  check_in:     string | null;
  check_out:    string | null;
  worked_hours: number | null;
  day_status:   DayStatus;
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
