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

function parseData(raw: AppNotification['data']): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return parseData(JSON.parse(raw) as AppNotification['data']);
    } catch {
      return {};
    }
  }
  return raw;
}

function isSeoUser(user: Pick<AuthUser, 'section' | 'role'> | null | undefined): boolean {
  return user?.section === 'seo' || user?.role === 'seo-member' || user?.role === 'seo-leader';
}

function isPmManager(user: Pick<AuthUser, 'role'> | null | undefined): boolean {
  return user?.role === 'manager';
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

function leavePath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string | null {
  if (user?.role === 'employee')   return ROUTES.EMPLOYEE.REQUESTS;
  if (user?.role === 'seo-member') return ROUTES.SEO_MEMBER.REQUESTS;
  if (user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager') {
    return ROUTES.LEAVES.LIST;
  }
  return null;
}

function messagesPath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string | null {
  if (user?.role === 'employee')   return ROUTES.EMPLOYEE.MESSAGES;
  if (user?.role === 'seo-member') return ROUTES.SEO_MEMBER.MESSAGES;
  if (user?.role === 'hr')         return ROUTES.MESSAGES;
  return null;
}

function resolveSeoTaskPath(
  data: Record<string, unknown>,
  user: Pick<AuthUser, 'section' | 'role'> | null | undefined,
): string | null {
  const nestedTask = readRecord(data.task);
  const nestedProject = readRecord(data.project);

  const projectId = readId(data.project_id, data.projectId, nestedProject?.id, nestedTask?.project_id, nestedTask?.projectId);
  const taskId = readId(data.task_id, data.taskId, nestedTask?.id);
  const taskUuid = readId(data.task_uuid, data.taskUuid, data.uuid, nestedTask?.uuid);

  if (!projectId) return null;

  const pid = String(projectId);

  if (user?.role === 'seo-leader') {
    return ROUTES.SEO_LEADER.DETAILS(pid);
  }

  if (taskUuid || taskId) return ROUTES.SEO_MEMBER.TASK_DETAIL(pid, String(taskUuid ?? taskId));
  return ROUTES.SEO_MEMBER.PROJECT_TASKS(pid);
}

function resolvePmTaskPath(
  data: Record<string, unknown>,
  user: Pick<AuthUser, 'role'> | null | undefined,
): string | null {
  const nestedTask = readRecord(data.task);
  const nestedProject = readRecord(data.project);

  const projectId = readId(data.project_id, data.projectId, nestedProject?.id, nestedTask?.project_id, nestedTask?.projectId);
  const taskId = readId(data.task_id, data.taskId, nestedTask?.id);

  if (isPmManager(user)) {
    return projectId ? ROUTES.PROJECT_MANAGER.DETAILS(String(projectId)) : ROUTES.PROJECT_MANAGER.TASKS;
  }

  if (projectId && taskId) return ROUTES.EMPLOYEE.TASK_DETAIL(String(projectId), String(taskId));
  if (projectId) return ROUTES.EMPLOYEE.PROJECT_TASKS(String(projectId));
  return ROUTES.EMPLOYEE.TASKS;
}

function resolveMessagesPath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string {
  if (user?.role === 'seo-member') return ROUTES.SEO_MEMBER.MESSAGES;
  if (user?.role === 'employee') return ROUTES.EMPLOYEE.MESSAGES;
  return ROUTES.MESSAGES;
}

function resolveProjectMessagesTabPath(
  projectId: string,
  user: Pick<AuthUser, 'section' | 'role'> | null | undefined,
): string {
  if (isPmManager(user)) {
    return `${ROUTES.PROJECT_MANAGER.DETAILS(projectId)}?tab=messages`;
  }
  if (user?.role === 'seo-leader') {
    return `${ROUTES.SEO_LEADER.DETAILS(projectId)}?tab=messages`;
  }
  if (user?.role === 'employee') {
    return ROUTES.EMPLOYEE.PROJECT_MESSAGES(projectId);
  }
  return ROUTES.EMPLOYEE.PROJECT_MESSAGES(projectId);
}

function resolveHrMessagesPath(
  data: Record<string, unknown>,
  user: Pick<AuthUser, 'role'> | null | undefined,
): string {
  const convId = readId(data.conversationId, data.conversation_id);
  const base = user?.role === 'employee' ? ROUTES.EMPLOYEE.MESSAGES : ROUTES.MESSAGES;
  return convId ? `${base}?conversation=${convId}` : base;
}

/** Resolve in-app path when a notification is clicked. */
export function resolveNotificationPath(
  notification: AppNotification,
  user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined,
): string | null {
  const data = parseData(notification.data);
  const type = notification.type ?? (typeof data.type === 'string' ? data.type : '');

  switch (type) {
    case 'test_notification':
      return null;

    case 'seo_task_assigned':
    case 'seo_task_status_changed':
      return resolveSeoTaskPath(data, user);

    case 'seo_mention':
      return resolveMessagesPath(user);

    case 'pm_project_message': {
      const projectId = readId(data.projectId, data.project_id);
      return projectId ? resolveProjectMessagesTabPath(String(projectId), user) : null;
    }

    case 'seo_project_message': {
      const projectId = readId(data.projectId, data.project_id);
      if (!projectId) return null;
      if (user?.role === 'seo-leader') {
        return `${ROUTES.SEO_LEADER.DETAILS(String(projectId))}?tab=messages`;
      }
      if (user?.role === 'seo-member') {
        return ROUTES.SEO_MEMBER.MESSAGES;
      }
      return `${ROUTES.SEO_LEADER.DETAILS(String(projectId))}?tab=messages`;
    }

    case 'hr_message':
      return resolveHrMessagesPath(data, user);

    case 'pm_task_assigned':
      return resolvePmTaskPath(data, user);

    case 'hr_leave_submitted': {
      const leaveId = readId(data.leave_id, data.leaveId, data.id);
      return leaveId ? ROUTES.LEAVES.DETAIL(String(leaveId)) : ROUTES.LEAVES.LIST;
    }

    default:
      break;
  }

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

  const nestedTask = readRecord(data.task);
  const nestedProject = readRecord(data.project);

  const projectId = readId(
    data.project_id, data.projectId, nestedProject?.id, nestedTask?.project_id, nestedTask?.projectId,
  );
  const taskId = readId(data.task_id, data.taskId, nestedTask?.id);
  const taskUuid = readId(data.task_uuid, data.taskUuid, data.uuid, nestedTask?.uuid);

  const seo = isSeoUser(user);

  if (projectId && (taskUuid || taskId)) {
    const pid = String(projectId);
    if (seo && user?.role === 'seo-leader') return ROUTES.SEO_LEADER.DETAILS(pid);
    if (seo && taskUuid) return ROUTES.SEO_MEMBER.TASK_DETAIL(pid, String(taskUuid));
    if (taskId) return ROUTES.EMPLOYEE.TASK_DETAIL(pid, String(taskId));
  }

  if (projectId && isTaskNotification(notification)) {
    const pid = String(projectId);
    return seo
      ? (user?.role === 'seo-leader' ? ROUTES.SEO_LEADER.DETAILS(pid) : ROUTES.SEO_MEMBER.PROJECT_TASKS(pid))
      : ROUTES.EMPLOYEE.PROJECT_TASKS(pid);
  }

  if (isTaskNotification(notification)) {
    if (seo) return user?.role === 'seo-leader' ? ROUTES.SEO_LEADER.TASKS : ROUTES.SEO_MEMBER.TASKS;
    return isPmManager(user) ? ROUTES.PROJECT_MANAGER.TASKS : ROUTES.EMPLOYEE.TASKS;
  }

  if (isLeaveNotification(notification)) {
    const leaveId = readId(data.leave_id, data.leaveId, data.id);
    if (leaveId && (user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager')) {
      return ROUTES.LEAVES.DETAIL(String(leaveId));
    }
    return leavePath(user);
  }

  if (isMessageNotification(notification)) {
    return messagesPath(user);
  }

  return null;
}
