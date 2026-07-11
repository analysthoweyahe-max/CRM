import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/app/router/routes';
import { myProjectsApi } from '@/shared/modules/my-projects/api/myProjects.api';
import { useEmployeeTasks } from '@/modules/employee/tasks/hooks/useEmployeeTasks';
import type { EmpTasksOverview, EmpProject } from '../types/dashboard.types';

export function useEmpDashboard() {
  const { data: tasks = [], isLoading: tasksLoading } = useEmployeeTasks();

  // GET /v1/employee/projects — membership only (never manager lists)
  const { data: membership = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['emp-dashboard', 'employee-projects'],
    queryFn:  () => myProjectsApi.listEmployeeProjects(),
    staleTime: 60_000,
  });

  const projects: EmpProject[] = useMemo(() => membership.map((project) => ({
    id:              project.uuid || project.id,
    name:            project.name,
    status:          project.status,
    statusLabel:     project.statusLabel,
    tasksTotal:      project.tasksAssigned,
    tasksCompleted:  project.tasksCompleted,
    progressPercent: project.progressPercent,
    tasksUrl:        project.tasksUrl
      ?? ROUTES.EMPLOYEE.PROJECT_TASKS(project.uuid),
    myProjectRole:   project.myProjectRole,
    module:          project.module,
  })), [membership]);

  const overview: EmpTasksOverview = {
    totalAssigned: tasks.length,
    inProgress:    tasks.filter(t => t.status === 'inProgress').length,
    completed:     tasks.filter(t => t.status === 'completed').length,
  };
  const pending = Math.max(0, overview.totalAssigned - overview.inProgress - overview.completed);

  return {
    isLoading: tasksLoading || projectsLoading,
    overview,
    pending,
    projects,
  };
}
