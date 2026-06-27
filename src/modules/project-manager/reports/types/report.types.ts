export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface WorkEntry {
  taskTitle:    string;
  plannedHours: number;
  actualHours:  number;
}

export interface DailyReport {
  id:            string;
  date:          string;   // YYYY-MM-DD
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
  targetDate:    string;
  submittedDate: string;
  status:        RequestStatus;
  comment?:      string;
}
