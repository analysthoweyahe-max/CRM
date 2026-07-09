export type WorkStatus = 'offline' | 'currently_working' | 'on_break';

export interface AttendanceStatusFlag {
  value: string;
  label: string;
}

export interface AttendanceBreak {
  id:        number;
  startedAt: string;
  endedAt:   string | null;
  isActive:  boolean;
}

export interface AttendanceRecordTimer {
  workStatus:    WorkStatus;
  workingHours:  number | null;
  canPause:      boolean;
  canResume:     boolean;
}

export interface AttendanceRecord {
  id:            string;
  date:          string;
  checkInTime:     string | null;
  checkOutTime:    string | null;
  workingHours:    number | null;
  breakMinutes:    number;
  statusFlags:     AttendanceStatusFlag[];
  timer?:          AttendanceRecordTimer;
  breaks?:         AttendanceBreak[];
}

export interface AttendanceTimer {
  workStatus:             WorkStatus;
  workStatusLabel:        string;
  workingHours:           number | null;
  breakMinutes:           number;
  isPaused:               boolean;
  isWorking:              boolean;
  canCheckIn:             boolean;
  canCheckOut:            boolean;
  canPause:               boolean;
  canResume:              boolean;
  activeBreakStartedAt:   string | null;
  checkInTime?:           string | null;
  checkOutTime?:          string | null;
  checkInUrl?:            string;
  checkOutUrl?:           string;
  pauseUrl?:              string;
  resumeUrl?:             string;
  attendanceTodayUrl?:    string;
}

export interface AttendanceTodayData extends AttendanceTimer {
  record:   AttendanceRecord | null;
  employee: { id: string; name: string };
}

export interface AttendanceTodayResponse {
  status:  string;
  message: string;
  data:    AttendanceTodayData;
}

export interface AttendanceHistoryRecord {
  id:            string | number;
  date:          string;
  checkInTime:     string | null;
  checkOutTime:    string | null;
  workingHours:    number | null;
  breakMinutes?:   number;
  dayStatus?:      string;
  dayStatusLabel?: string;
  statusFlags?:    AttendanceStatusFlag[];
  // legacy snake_case from older endpoints
  check_in?:       string | null;
  check_out?:      string | null;
  worked_hours?:   number | null;
  day_status?:     string;
}

export interface AttendanceHistoryResponse {
  status:  string;
  message: string;
  data: {
    data:         AttendanceHistoryRecord[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page?:    number;
  };
}

export interface AttendanceSummaryData {
  month:           string;
  presentDays:     number;
  absentDays:      number;
  lateCount:       number;
  earlyLeaveCount: number;
  totalWorkHours:  number;
}

export interface AttendanceSummaryResponse {
  status:  string;
  message: string;
  data:    AttendanceSummaryData;
}

export type AttendanceScope = 'employee' | 'pm' | 'seo';
