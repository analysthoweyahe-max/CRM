export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id:             string;
  empId:          string;
  empNameAr:      string;
  empNameEn:      string;
  empDeptAr:      string;
  empDeptEn:      string;
  empJobTitleAr:  string;
  empJobTitleEn:  string;
  empInitial:     string;
  empAvatarBg:    string;
  leaveTypeAr:    string;
  leaveTypeEn:    string;
  from:           string;
  to:             string;
  durationAr:     string;
  durationEn:     string;
  requestDate:    string;
  status:         LeaveStatus;
  reason:         string;
  approvalDate?:  string;
  notes?:         string;
  rejectionReason?: string;
  attachment?:    { nameAr: string; nameEn: string; sizeKB: number };
}
