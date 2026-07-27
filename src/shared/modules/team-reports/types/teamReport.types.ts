export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type FilterKey     = 'all' | RequestStatus;

export interface WorkEntry {
  tasks:        string[];
  plannedHours: number;
  actualHours:  number;
}

export interface DailyReport {
  id:            string;
  date:          string;
  memberName:    string;
  memberInitial: string;
  memberColor:   string;
  checkIn:       string;
  checkOut:      string;
  entry:         WorkEntry;
  notes:         string;
}

export interface RequestItem {
  id:            string;
  memberName:    string;
  memberInitial: string;
  memberColor:   string;
  typeAr:        string;
  typeEn:        string;
  bodyAr:        string;
  bodyEn:        string;
  title?:        string;
  targetDate:    string;
  submittedDate: string;
  status:        RequestStatus;
  comment?:      string;
  canApprove?:   boolean;
  canReject?:    boolean;
  /** Only present for leave/vacation requests — sourced straight from the backend, never computed client-side. */
  vacationTypeLabel?: string | null;
  daysCount?:         number | null;
  remainingBalance?:  number | null;
}
