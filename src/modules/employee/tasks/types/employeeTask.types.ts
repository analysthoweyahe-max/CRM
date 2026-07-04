export type EmpTaskStatus   = 'pending' | 'inProgress' | 'completed';
export type EmpTaskPriority = 'low' | 'medium' | 'high';

export interface EmployeeTask {
  id:         string;
  projectId:  string;
  titleAr:    string;
  titleEn:    string;
  projectAr:  string;
  projectEn:  string;
  deadline:   string;
  priority:   EmpTaskPriority;
  status:     EmpTaskStatus;
  phaseId?:   string;
  phaseName?: string;
}

export interface EmpTaskListResponse {
  status: string;
  data:   { data: EmployeeTask[] };
}

export interface CreateSelfTaskPayload {
  title:           string;
  description?:    string;
  priority:        'low' | 'normal' | 'high';
  due_date?:       string;
  estimated_hours?: number;
  phase_id?:       number;
}
