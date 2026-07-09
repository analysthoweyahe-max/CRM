import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/app/router/routes';
import { normalizePmDashboardSections } from '@/shared/modules/my-projects/api/myProjects.api';
import { pmDashboardApi } from '@/modules/project-manager/dashboard/api/dashboard.api';
import { useEmployeeTasks } from '@/modules/employee/tasks/hooks/useEmployeeTasks';
import type { EmpTasksOverview, EmpProject } from '../types/dashboard.types';

const EMPTY_OVERVIEW: EmpTasksOverview = { totalAssigned: 0, inProgress: 0, completed: 0 };

export function useEmpDashboard() {
  const { data: tasks = [], isLoading: tasksLoading } = useEmployeeTasks();

  const { data: dashboardPayload, isLoading: projectsLoading } = useQuery({
    queryKey: ['emp-dashboard', 'pm-dashboard'],
    queryFn:  () => pmDashboardApi.get().then(r => r.data.data),
    staleTime: 60_000,
  });

  const projects: EmpProject[] = useMemo(() => {
    const sections = normalizePmDashboardSections(dashboardPayload);
    return sections.flatMap((section) =>
      section.projects.map((project) => ({
        id:               project.id,
        name:             project.name,
        status:           project.status,
        statusLabel:      project.statusLabel,
        tasksTotal:       project.tasksAssigned,
        tasksCompleted:   project.tasksCompleted,
        progressPercent:  project.progressPercent,
        tasksUrl:         project.tasksUrl ?? ROUTES.EMPLOYEE.TASKS,
      })),
    );
  }, [dashboardPayload]);

  const dashboardOverview = dashboardPayload?.tasksOverview;
  const overview: EmpTasksOverview = dashboardOverview ?? {
    totalAssigned: tasks.length,
    inProgress:    tasks.filter(t => t.status === 'inProgress').length,
    completed:     tasks.filter(t => t.status === 'completed').length,
  };
  const pending = Math.max(0, overview.totalAssigned - overview.inProgress - overview.completed);

  return {
    isLoading: tasksLoading || projectsLoading,
    overview:  (dashboardOverview || tasks.length) ? overview : EMPTY_OVERVIEW,
    pending,
    projects,
  };
}
