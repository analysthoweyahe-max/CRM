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

/**
 * After any SEO task update (edit / status / phase): refresh detail drawers,
 * campaign/member boards, and home/dashboard lists.
 */
export function invalidateAfterSeoTaskUpdate(
  qc: QueryClient,
  projectId?: string | null,
  taskId?: string | null,
) {
  if (projectId && taskId) {
    qc.invalidateQueries({ queryKey: ['seo-task', projectId, taskId] });
    qc.invalidateQueries({ queryKey: ['seo-member', 'task-detail', projectId, taskId] });
  }
  if (projectId) {
    qc.invalidateQueries({ queryKey: ['campaign-tasks', projectId] });
    qc.invalidateQueries({ queryKey: ['seo-member-project-tasks', projectId] });
  }
  invalidateSeoMemberHomeTasks(qc);
}

/**
 * After any PM/employee task update: refresh detail pages and home boards.
 */
export function invalidateAfterPmTaskUpdate(
  qc: QueryClient,
  projectId?: string | null,
  taskId?: string | null,
) {
  if (projectId && taskId) {
    qc.invalidateQueries({ queryKey: ['task-detail', projectId, taskId] });
    qc.invalidateQueries({ queryKey: ['pm-task-detail', projectId, taskId] });
  }
  invalidateEmployeeHomeTasks(qc);
}
