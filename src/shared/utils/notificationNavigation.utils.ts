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

function isAdminRequestNotification(notification: AppNotification): boolean {
  const haystack = `${notification.type} ${notification.title} ${notification.body}`.toLowerCase();
  if (/leave|إجاز|exception|استثناء|attendance/.test(haystack)) return false;
  return /admin.?request|employee.?request|طلب إداري|request_type|permission request|support request/.test(haystack)
    || notification.type.toLowerCase().includes('adminrequest');
}

function isMessageNotification(notification: AppNotification): boolean {
  if (notification.type === 'PmMentionNotification') return false;
  if (notification.type === 'seo_mention' || notification.type === 'seo_direct_mention' || notification.type === 'pm_mention') {
    return false;
  }
  const haystack = `${notification.type} ${notification.title} ${notification.body}`.toLowerCase();
  return /message|mention|رسال|منشن/.test(haystack);
}

function leavePath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string | null {
  if (user?.role === 'employee')   return ROUTES.EMPLOYEE.LEAVE;
  if (user?.role === 'seo-member') return ROUTES.SEO_MEMBER.LEAVE;
  if (user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager') {
    return ROUTES.LEAVES.LIST;
  }
  return null;
}

function employeeLeaveListPath(
  user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined,
): string {
  if (user?.role === 'seo-member' || user?.section === 'seo') return ROUTES.SEO_MEMBER.LEAVE;
  return ROUTES.EMPLOYEE.LEAVE;
}

function employeeExceptionListPath(
  user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined,
): string {
  if (user?.role === 'manager') return ROUTES.PROJECT_MANAGER.ATTENDANCE_EXCEPTIONS;
  if (user?.role === 'seo-leader') return ROUTES.SEO_LEADER.ATTENDANCE_EXCEPTIONS;
  if (user?.role === 'seo-member' || user?.section === 'seo') {
    return ROUTES.SEO_MEMBER.ATTENDANCE_EXCEPTIONS;
  }
  return ROUTES.EMPLOYEE.ATTENDANCE_EXCEPTIONS;
}

/** Backend realtime / FCM payloads use leaveRequestId; older payloads used leave_id. */
function readLeaveRequestId(data: Record<string, unknown>): string | undefined {
  const id = readId(
    data.leaveRequestId,
    data.leave_request_id,
    data.leave_id,
    data.leaveId,
    data.id,
  );
  return id !== undefined ? String(id) : undefined;
}

/** Backend realtime / FCM payloads use exceptionRequestId. */
function readExceptionRequestId(data: Record<string, unknown>): string | undefined {
  const id = readId(
    data.exceptionRequestId,
    data.exception_request_id,
    data.exceptionId,
    data.exception_id,
    data.id,
  );
  return id !== undefined ? String(id) : undefined;
}

function adminRequestPath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string | null {
  if (user?.role === 'employee')    return ROUTES.EMPLOYEE.ADMIN_REQUESTS;
  if (user?.role === 'seo-member')  return ROUTES.SEO_MEMBER.ADMIN_REQUESTS;
  if (user?.role === 'manager')     return ROUTES.PROJECT_MANAGER.REPORTS;
  if (user?.role === 'seo-leader')  return ROUTES.SEO_LEADER.REPORTS;
  if (user?.section === 'seo')      return ROUTES.SEO_MEMBER.ADMIN_REQUESTS;
  if (user?.section === 'pm')       return ROUTES.EMPLOYEE.ADMIN_REQUESTS;
  return null;
}

function messagesPath(user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined): string | null {
  if (user?.role === 'employee')    return ROUTES.EMPLOYEE.MESSAGES;
  if (user?.role === 'seo-member')  return ROUTES.SEO_MEMBER.MESSAGES;
  if (user?.role === 'manager')     return ROUTES.PROJECT_MANAGER.MESSAGES;
  if (user?.role === 'seo-leader')  return ROUTES.SEO_LEADER.MESSAGES;
  if (user?.role === 'hr')          return ROUTES.MESSAGES;
  if (user?.role === 'admin')       return ROUTES.MESSAGES;
  // Section fallback when portal role isn't set yet
  if (user?.section === 'seo')      return ROUTES.SEO_MEMBER.MESSAGES;
  if (user?.section === 'pm')       return ROUTES.EMPLOYEE.MESSAGES;
  if (user?.actor === 'employee')   return ROUTES.EMPLOYEE.MESSAGES;
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

  if (taskId || taskUuid) return ROUTES.SEO_MEMBER.TASK_DETAIL(pid, String(taskId ?? taskUuid));
  return ROUTES.SEO_MEMBER.DETAILS(pid);
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
  return messagesPath(user) ?? ROUTES.MESSAGES;
}

/** Topbar / nav shortcut to the role's messages inbox.
 *  When `layoutScope` is set (or the URL is under a portal), prefer that
 *  portal's chat so admin/super-admin in the PM layout open PM messages.
 */
export function getMessagesRoute(
  user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined,
  layoutScope?: 'employee' | 'pm' | 'seo' | null,
): string {
  if (layoutScope === 'pm') return ROUTES.PROJECT_MANAGER.MESSAGES;
  if (layoutScope === 'seo') {
    return user?.role === 'seo-member'
      ? ROUTES.SEO_MEMBER.MESSAGES
      : ROUTES.SEO_LEADER.MESSAGES;
  }
  if (layoutScope === 'employee') return ROUTES.EMPLOYEE.MESSAGES;

  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/project-manager')) return ROUTES.PROJECT_MANAGER.MESSAGES;
    if (path.startsWith('/seo-leader')) return ROUTES.SEO_LEADER.MESSAGES;
    if (path.startsWith('/seo-member')) return ROUTES.SEO_MEMBER.MESSAGES;
    if (path.startsWith('/employee')) return ROUTES.EMPLOYEE.MESSAGES;
  }

  return resolveMessagesPath(user);
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
  const base = (user?.role === 'employee' || user?.role === 'seo-member')
    ? ROUTES.EMPLOYEE.HR_MESSAGES
    : ROUTES.MESSAGES;
  return convId ? `${base}?conversation=${convId}` : base;
}

function resolvePmProjectPath(
  data: Record<string, unknown>,
  user: Pick<AuthUser, 'role'> | null | undefined,
): string | null {
  const projectId = readId(data.projectId, data.project_id, data.projectUuid, data.project_uuid);
  if (!projectId) {
    return isPmManager(user) ? ROUTES.PROJECT_MANAGER.DASHBOARD : ROUTES.EMPLOYEE.MY_PROJECTS;
  }
  const pid = String(projectId);
  if (isPmManager(user)) return ROUTES.PROJECT_MANAGER.DETAILS(pid);
  return ROUTES.EMPLOYEE.PROJECT_TASKS(pid);
}

function resolveSeoProjectPath(
  data: Record<string, unknown>,
  user: Pick<AuthUser, 'section' | 'role'> | null | undefined,
): string | null {
  const projectId = readId(data.projectId, data.project_id, data.projectUuid, data.project_uuid);
  if (!projectId) {
    if (user?.role === 'seo-leader') return ROUTES.SEO_LEADER.DASHBOARD;
    return ROUTES.SEO_MEMBER.MY_PROJECTS;
  }
  const pid = String(projectId);
  if (user?.role === 'seo-leader') return ROUTES.SEO_LEADER.DETAILS(pid);
  return ROUTES.SEO_MEMBER.DETAILS(pid);
}

function appendQuery(path: string, params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

function isTaskCommentContext(contextType: string): boolean {
  return /task.?comment|seotaskcomment|pmtaskcomment/i.test(contextType);
}

function isProjectMessageContext(contextType: string): boolean {
  return /project.?message|seoprojectmessage|seomessage|pmprojectmessage/i.test(contextType)
    && !isTaskCommentContext(contextType);
}

function isClientUpdateContext(contextType: string): boolean {
  return /client.?update/i.test(contextType);
}

/** seo_mention → project (and comment/message context when provided). */
function resolveSeoMentionPath(
  data: Record<string, unknown>,
  user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined,
): string | null {
  const projectId = readId(data.projectId, data.project_id, data.projectUuid, data.project_uuid);
  const contextType = String(data.contextType ?? data.context_type ?? '');
  const contextId = readId(data.contextId, data.context_id);
  const taskId = readId(data.taskId, data.task_id, data.taskUuid, data.task_uuid);

  if (!projectId) return resolveSeoProjectPath(data, user);

  const pid = String(projectId);

  if (isTaskCommentContext(contextType)) {
    if (taskId) {
      if (user?.role === 'seo-leader') {
        return appendQuery(ROUTES.SEO_LEADER.DETAILS(pid), {
          task: taskId,
          tab: 'comments',
          comment: contextId,
        });
      }
      return appendQuery(ROUTES.SEO_MEMBER.TASK_DETAIL(pid, String(taskId)), {
        tab: 'comments',
        comment: contextId,
      });
    }

    // No taskId — land on the project; page will resolve comment → task.
    if (user?.role === 'seo-leader') {
      return appendQuery(ROUTES.SEO_LEADER.DETAILS(pid), {
        contextType,
        comment: contextId,
      });
    }
    return appendQuery(ROUTES.SEO_MEMBER.DETAILS(pid), {
      contextType,
      comment: contextId,
    });
  }

  if (isProjectMessageContext(contextType)) {
    if (user?.role === 'seo-leader') {
      return appendQuery(ROUTES.SEO_LEADER.DETAILS(pid), {
        tab: 'messages',
        message: contextId,
      });
    }
    return appendQuery(ROUTES.SEO_MEMBER.DETAILS(pid), {
      tab: 'messages',
      message: contextId,
    });
  }

  if (isClientUpdateContext(contextType)) {
    if (user?.role === 'seo-leader') {
      return appendQuery(ROUTES.SEO_LEADER.DETAILS(pid), {
        tab: 'client-updates',
        message: contextId,
      });
    }
    return appendQuery(ROUTES.SEO_MEMBER.DETAILS(pid), {
      tab: 'messages',
      message: contextId,
    });
  }

  return resolveSeoProjectPath(data, user);
}

function resolveSeoDirectMentionPath(
  data: Record<string, unknown>,
  user: Pick<AuthUser, 'section' | 'role' | 'actor'> | null | undefined,
): string {
  const convId = readId(data.conversation_id, data.conversationId);
  const messageId = readId(data.message_id, data.messageId);
  const base = resolveMessagesPath(user);
  return appendQuery(base, {
    conversation: convId,
    message: messageId,
  });
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
    case 'seo_task_created':
    case 'seo_task_status_changed':
      return resolveSeoTaskPath(data, user);

    case 'seo_mention':
      return resolveSeoMentionPath(data, user);

    case 'seo_direct_mention':
      return resolveSeoDirectMentionPath(data, user);

    case 'pm_mention':
    case 'PmMentionNotification':
      return resolvePmProjectPath(data, user);

    case 'pm_project_team_assigned':
    case 'pm_project_manager_assigned':
      return resolvePmProjectPath(data, user);

    case 'seo_project_team_assigned':
    case 'seo_project_manager_assigned':
      return resolveSeoProjectPath(data, user);

    case 'pm_project_message': {
      const projectId = readId(data.projectId, data.project_id);
      return projectId ? resolveProjectMessagesTabPath(String(projectId), user) : null;
    }

    case 'pm_client_update': {
      const projectId = readId(data.projectId, data.project_id);
      if (!projectId) return null;
      if (isPmManager(user)) {
        return `${ROUTES.PROJECT_MANAGER.DETAILS(String(projectId))}?tab=client-updates`;
      }
      return resolveProjectMessagesTabPath(String(projectId), user);
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

    case 'seo_client_update': {
      const projectId = readId(data.projectId, data.project_id);
      if (!projectId) return null;
      if (user?.role === 'seo-leader') {
        return `${ROUTES.SEO_LEADER.DETAILS(String(projectId))}?tab=client-updates`;
      }
      return ROUTES.SEO_MEMBER.MESSAGES;
    }

    case 'seo_direct_message': {
      const convId = readId(data.conversationId, data.conversation_id);
      const base = resolveMessagesPath(user);
      return convId ? `${base}?conversation=${convId}` : base;
    }

    case 'hr_message':
      return resolveHrMessagesPath(data, user);

    case 'pm_task_assigned':
      return resolvePmTaskPath(data, user);

    case 'hr_leave_submitted': {
      const leaveId = readLeaveRequestId(data);
      return leaveId ? ROUTES.LEAVES.DETAIL(leaveId) : ROUTES.LEAVES.LIST;
    }

    case 'hr_leave_status_updated': {
      const leaveId = readLeaveRequestId(data);
      const base = employeeLeaveListPath(user);
      return leaveId ? appendQuery(base, { leave: leaveId }) : base;
    }

    case 'hr_attendance_exception_submitted': {
      const exceptionId = readExceptionRequestId(data);
      return exceptionId
        ? appendQuery(ROUTES.ATTENDANCE.EXCEPTIONS, { exception: exceptionId })
        : ROUTES.ATTENDANCE.EXCEPTIONS;
    }

    case 'hr_attendance_exception_status_updated': {
      const exceptionId = readExceptionRequestId(data);
      const base = employeeExceptionListPath(user);
      return exceptionId ? appendQuery(base, { exception: exceptionId }) : base;
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
    if (seo && (taskId || taskUuid)) return ROUTES.SEO_MEMBER.TASK_DETAIL(pid, String(taskId ?? taskUuid));
    if (taskId) return ROUTES.EMPLOYEE.TASK_DETAIL(pid, String(taskId));
  }

  if (projectId && isTaskNotification(notification)) {
    const pid = String(projectId);
    return seo
      ? (user?.role === 'seo-leader' ? ROUTES.SEO_LEADER.DETAILS(pid) : ROUTES.SEO_MEMBER.DETAILS(pid))
      : ROUTES.EMPLOYEE.PROJECT_TASKS(pid);
  }

  if (isTaskNotification(notification)) {
    if (seo) return user?.role === 'seo-leader' ? ROUTES.SEO_LEADER.TASKS : ROUTES.SEO_MEMBER.TASKS;
    return isPmManager(user) ? ROUTES.PROJECT_MANAGER.TASKS : ROUTES.EMPLOYEE.TASKS;
  }

  if (isLeaveNotification(notification)) {
    const leaveId = readLeaveRequestId(data);
    if (leaveId && (user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager')) {
      return ROUTES.LEAVES.DETAIL(leaveId);
    }
    if (leaveId) return appendQuery(employeeLeaveListPath(user), { leave: leaveId });
    return leavePath(user);
  }

  if (/attendance.?exception|استثناء/.test(
    `${notification.type} ${notification.title} ${notification.body}`.toLowerCase(),
  )) {
    const exceptionId = readExceptionRequestId(data);
    if (user?.role === 'hr' || user?.role === 'admin') {
      return exceptionId
        ? appendQuery(ROUTES.ATTENDANCE.EXCEPTIONS, { exception: exceptionId })
        : ROUTES.ATTENDANCE.EXCEPTIONS;
    }
    const base = employeeExceptionListPath(user);
    return exceptionId ? appendQuery(base, { exception: exceptionId }) : base;
  }

  if (isAdminRequestNotification(notification)) {
    return adminRequestPath(user);
  }

  if (isMessageNotification(notification)) {
    return messagesPath(user);
  }

  return null;
}
