import { myProjectsApi } from '@/shared/modules/my-projects/api/myProjects.api';
import type { EmpProjectListResponse } from '../types/dashboard.types';

export const empDashboardApi = {
  /** Membership only — GET /v1/employee/projects (never manager lists). */
  async myProjects(): Promise<{ data: EmpProjectListResponse }> {
    const projects = await myProjectsApi.listEmployeeProjects();
    return {
      data: {
        status:  'success',
        message: '',
        data: {
          data: projects.map((p) => ({
            id:              p.uuid || p.id,
            name:            p.name,
            status:          p.status,
            statusLabel:     p.statusLabel,
            tasksTotal:      p.tasksAssigned,
            tasksCompleted:  p.tasksCompleted,
            progressPercent: p.progressPercent,
            tasksUrl:        p.tasksUrl ?? undefined,
            myProjectRole:   p.myProjectRole,
            module:          p.module,
          })),
        },
      },
    };
  },
};
