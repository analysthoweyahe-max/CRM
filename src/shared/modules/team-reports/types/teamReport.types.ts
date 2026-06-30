export type RequestStatus = 'pending' | 'approved' | 'rejected';
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
  targetDate:    string;
  submittedDate: string;
  status:        RequestStatus;
  comment?:      string;
}
