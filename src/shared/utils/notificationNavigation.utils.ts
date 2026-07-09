import { ROUTES } from '@/app/router/routes';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import type { AppNotification } from '@/shared/types/notification.types';

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function readId(...values: unknown[]): string | number | undefined {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'string' || typeof value === 'number') return value;
    const nested = readRecord(value);
    if (nested?.id !== undefined) return nested.id as string | number;
  }
  return undefined;
}

function isSeoUser(user: Pick<AuthUser, 'section' | 'role'> | null | undefined): boolean {
  return user?.section === 'seo' || user?.role === 'seo-member';
}

function isTaskNotification(notification: AppNotification): boolean {
  const haystack = `${notification.type} ${notification.title} ${notification.body}`.toLowerCase();
  return /task|مهمة|pm task|seo task/.test(haystack);
}

function isLeaveNotification(notification: AppNotification): boolean {
  const haystack = `${notification.type} ${notification.title} ${notification.body}`.toLowerCase();
  return /leave|إجاز/.test(haystack);
}

function isMessageNotification(notification: AppNotification): boolean {
  if (notification.type === 'PmMentionNotification') return true;
  const haystack = `${notification.type} ${notification.title} ${notification.body}`.toLowerCase();
  return /message|mention|رسال|منشن/.test(haystack);
}

/** Only roles with a confirmed dedicated leave-requests page get routed;
 * everything else falls back to `null` (dropdown still closes on click). */
function leavePath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string | null {
  if (user?.role === 'employee')   return ROUTES.EMPLOYEE.REQUESTS;
  if (user?.role === 'seo-member') return ROUTES.SEO_MEMBER.REQUESTS;
  if (user?.role === 'hr')         return ROUTES.LEAVES.LIST;
  return null;
}

/** Only roles with a confirmed dedicated messages page get routed. */
function messagesPath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string | null {
  if (user?.role === 'employee')   return ROUTES.EMPLOYEE.MESSAGES;
  if (user?.role === 'seo-member') return ROUTES.SEO_MEMBER.MESSAGES;
  if (user?.role === 'hr')         return ROUTES.MESSAGES;
  return null;
}

/** Resolve in-app path when a notification is clicked. */
export function resolveNotificationPath(
  notification: AppNotification,
  user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined,
): string | null {
  let data = notification.data ?? {};
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data) as Record<string, unknown>;
    } catch {
      data = {};
    }
  }
  const nestedTask = readRecord(data.task);
  const nestedProject = readRecord(data.project);

  const explicitUrl = data.url ?? data.link ?? data.redirect_path ?? data.redirectPath;
  if (typeof explicitUrl === 'string') {
    if (explicitUrl.startsWith('/')) return explicitUrl;
    if (explicitUrl.startsWith('http')) {
      try {
        const path = new URL(explicitUrl).pathname;
        return path.startsWith('/api/') ? path.replace(/^\/api/, '') : path;
      } catch {
        return null;
      }
    }
  }

  const projectId = readId(
    data.project_id, data.projectId, nestedProject?.id, nestedTask?.project_id, nestedTask?.projectId,
  );
  const taskId = readId(data.task_id, data.taskId, nestedTask?.id);
  const taskUuid = readId(data.task_uuid, data.taskUuid, data.uuid, nestedTask?.uuid);

  const seo = isSeoUser(user);

  if (projectId && (taskUuid || taskId)) {
    if (seo && taskUuid) return ROUTES.SEO_MEMBER.TASK_DETAIL(projectId, taskUuid);
    if (taskId) return ROUTES.EMPLOYEE.TASK_DETAIL(projectId, taskId);
  }

  if (projectId && isTaskNotification(notification)) {
    return seo
      ? ROUTES.SEO_MEMBER.PROJECT_TASKS(projectId)
      : ROUTES.EMPLOYEE.PROJECT_TASKS(projectId);
  }

  if (isTaskNotification(notification)) {
    return seo ? ROUTES.SEO_MEMBER.TASKS : ROUTES.EMPLOYEE.TASKS;
  }

  if (isLeaveNotification(notification)) {
    return leavePath(user);
  }

  if (isMessageNotification(notification)) {
    return messagesPath(user);
  }

  return null;
}
