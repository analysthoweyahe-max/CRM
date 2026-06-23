export type DayStatus  = 'present' | 'late' | 'absent' | 'leave';
export type WorkStatus = 'working' | 'done' | 'not_started';

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
