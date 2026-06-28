export type EmpTaskStatus   = 'pending' | 'inProgress' | 'completed';
export type EmpTaskPriority = 'low' | 'medium' | 'high';

export interface EmployeeTask {
  id:         string;
  titleAr:    string;
  titleEn:    string;
  projectAr:  string;
  projectEn:  string;
  deadline:   string;
  priority:   EmpTaskPriority;
  status:     EmpTaskStatus;
}

export interface EmpTaskListResponse {
  status: string;
  data:   { data: EmployeeTask[] };
}
