import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/app/router/routes';
import { myProjectsApi } from '@/shared/modules/my-projects/api/myProjects.api';
import { useEmployeeTasks } from '@/modules/employee/tasks/hooks/useEmployeeTasks';
import type { EmpTasksOverview, EmpProject } from '../types/dashboard.types';

export function useEmpDashboard() {
  const { data: tasks = [], isLoading: tasksLoading } = useEmployeeTasks();

  // `/v1/employee/projects` — confirmed reliable source of the employee's
  // own projects (unlike `/v1/pm/dashboard`, which returns empty sections
  // for accounts confirmed to have real project assignments).
  const { data: employeeProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['emp-dashboard', 'employee-projects'],
    queryFn:  () => myProjectsApi.listEmployeeProjects(),
    staleTime: 60_000,
  });

  const projects: EmpProject[] = useMemo(() => employeeProjects.map((project) => ({
    id:              project.id,
    name:            project.name,
    status:          project.status,
    statusLabel:     project.statusLabel,
    tasksTotal:      project.tasksTotal,
    tasksCompleted:  project.tasksCompleted,
    progressPercent: project.progressPercent,
    tasksUrl:        project.tasksUrl ?? ROUTES.EMPLOYEE.PROJECT_TASKS(project.id),
  })), [employeeProjects]);

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
