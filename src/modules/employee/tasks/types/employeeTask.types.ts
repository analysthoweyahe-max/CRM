export type EmpTaskStatus   = 'pending' | 'inProgress' | 'completed';
export type EmpTaskPriority = 'low' | 'medium' | 'high';

export interface EmployeeTask {
  id:            string;
  projectId:     string;
  titleAr:       string;
  titleEn:       string;
  projectAr:     string;
  projectEn:     string;
  deadline:      string;
  priority:      EmpTaskPriority;
  status:        EmpTaskStatus;
  phaseId?:      string;
  phaseName?:    string;
  dueAt?:        string | null;
  isOverdue?:    boolean;
  isDelayed?:    boolean;
  overdueLabel?: string | null;
  canExtend?:    boolean;
  importantLinks?: string[];
}

export interface EmpTaskListResponse {
  status: string;
  data:   { data: EmployeeTask[] };
}

export interface CreateSelfTaskPayload {
  title:            string;
  description?:     string;
  priority?:        'low' | 'normal' | 'high';
  dueDate?:         string;
  estimatedHours?:  number;
  phaseId?:         number;
  file?:            File;
  importantLinks?:  string[];
}
