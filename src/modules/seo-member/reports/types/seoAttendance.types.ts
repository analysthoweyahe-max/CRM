export interface SeoAttendanceSummary {
  month:           string;
  presentDays:     number;
  absentDays:      number;
  lateCount:       number;
  earlyLeaveCount: number;
  totalWorkHours:  number;
}

export interface SeoAttendanceRecord {
  id?:          string | number;
  date:         string;
  check_in:     string | null;
  check_out:    string | null;
  worked_hours: number | null;
  day_status:   'present' | 'late' | 'absent' | 'leave' | 'holiday';
}

export interface SeoAttendanceSummaryResponse {
  status:  string;
  message: string;
  data:    SeoAttendanceSummary;
}

export interface SeoAttendanceHistoryResponse {
  status:  string;
  message: string;
  data: {
    data:         SeoAttendanceRecord[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}
