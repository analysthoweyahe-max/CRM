import { http } from '@/shared/services/http.service';
import { pmTaskApi } from '@/modules/project-manager/tasks/api/task.api';
import type { EmployeeTask, EmpTaskListResponse, EmpTaskStatus, EmpTaskPriority, CreateSelfTaskPayload } from '../types/employeeTask.types';

/* ── Raw backend shape — GET /v1/pm/employee/tasks?mine=1 ────────────────
   Confirmed: grouped into status columns, same as GET /v1/pm/projects/{id}/tasks —
   NOT a flat paginated list. */
interface RawPmTaskRef { id: number; name: string; }

interface RawPmTask {
  id:             number;
  title:          string;
  status:         string;   // 'pending' | 'in_progress' | 'completed' | ...
  priority:       string;   // 'low' | 'normal' | 'high'
  dueDate:        string | null;
  phase?:         RawPmTaskRef | null;
  project?:       RawPmTaskRef | null;
}

interface RawPmTaskColumn {
  status:      string;
  statusLabel: string;
  tasks:       RawPmTask[];
}

interface RawPmTaskListResponse {
  status:  string;
  message: string;
  data: {
    columns: RawPmTaskColumn[];
    total:   number;
  };
}

const STATUS_MAP: Record<string, EmpTaskStatus> = {
  pending:     'pending',
  in_progress: 'inProgress',
  completed:   'completed',
};

const PRIORITY_MAP: Record<string, EmpTaskPriority> = {
  low:    'low',
  normal: 'medium',
  high:   'high',
};

function toEmployeeTask(raw: RawPmTask): EmployeeTask {
  const projectName = raw.project?.name ?? raw.phase?.name ?? '';
  return {
    id:        String(raw.id),
    projectId: String(raw.project?.id ?? ''),
    titleAr:   raw.title,
    titleEn:   raw.title,
    projectAr: projectName,
    projectEn: projectName,
    deadline:  raw.dueDate ?? '',
    priority:  PRIORITY_MAP[raw.priority] ?? 'medium',
    status:    STATUS_MAP[raw.status]     ?? 'pending',
    phaseId:   raw.phase ? String(raw.phase.id) : undefined,
    phaseName: raw.phase?.name,
  };
}

export const employeeTaskApi = {
  async list(): Promise<{ data: EmpTaskListResponse }> {
    const res = await http.get<RawPmTaskListResponse>('/v1/pm/employee/tasks');
    const tasks = res.data.data.columns.flatMap(c => c.tasks);
    return {
      data: {
        status: res.data.status,
        data:   { data: tasks.map(toEmployeeTask) },
      },
    };
  },

  createSelfTask(projectId: string, payload: CreateSelfTaskPayload) {
    return pmTaskApi.createSelf(projectId, payload);
  },
};
