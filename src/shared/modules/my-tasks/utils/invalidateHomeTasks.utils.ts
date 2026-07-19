import type { QueryClient } from '@tanstack/react-query';

/** Refresh employee home “My Tasks” + related boards after a task is created/changed. */
export function invalidateEmployeeHomeTasks(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['employee', 'tasks'] });
  qc.invalidateQueries({ queryKey: ['emp-dashboard'] });
  qc.invalidateQueries({ queryKey: ['my-tasks'] });
  qc.invalidateQueries({ queryKey: ['pm-dashboard'] });
}

/** Refresh SEO member home “My Tasks” + related boards after a task is created/changed. */
export function invalidateSeoMemberHomeTasks(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] });
  qc.invalidateQueries({ queryKey: ['seo-member', 'dashboard'] });
  qc.invalidateQueries({ queryKey: ['seo-member', 'employee-projects'] });
  qc.invalidateQueries({ queryKey: ['seo-member-project-tasks'] });
  qc.invalidateQueries({ queryKey: ['my-tasks'] });
  qc.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
}
