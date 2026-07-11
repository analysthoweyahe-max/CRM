import type { AppNotification } from '@/shared/types/notification.types';
import type { Role } from '@/shared/types/role.types';

/** Employee-facing leave status update — must not appear for HR/admin reviewers. */
export function isEmployeeLeaveStatusNotification(notification: AppNotification): boolean {
  if (notification.type === 'leave') return true;

  const haystack = `${notification.title} ${notification.body}`.toLowerCase();
  return /إجازتك|your leave|leave status|حالة إجازتك|حالة طلب إجازتك/.test(haystack);
}

/** HR/admin reviewer alert when an employee submits a new leave request. */
export function isHrLeaveSubmittedNotification(notification: AppNotification): boolean {
  return notification.type === 'hr_leave_submitted';
}

/** Personal "assigned to you" alerts — for the assignee employee only.
 * Super-admin / admin mirrors must not show these as if they were the recipient.
 */
export function isPersonalAssigneeNotification(notification: AppNotification): boolean {
  const type = notification.type ?? '';
  return (
    type === 'pm_task_assigned'
    || type === 'seo_task_assigned'
    || type === 'bonus_applied'
    || type === 'deduction_applied'
    || type === 'leave'
    || /TaskAssignedNotification$/i.test(type)
  );
}

const REVIEWER_ROLES = new Set<Role>(['admin', 'hr', 'manager', 'seo-leader']);
const EMPLOYEE_ROLES = new Set<Role>(['employee', 'seo-member']);

/** Hide notifications that were routed to the wrong role by the backend. */
export function filterNotificationsForRole(
  items: AppNotification[],
  role: Role | undefined,
  actor?: 'admin' | 'employee',
): AppNotification[] {
  if (!role) return items;

  // Employee accounts always keep assignment / payroll alerts for themselves.
  if (actor === 'employee' || EMPLOYEE_ROLES.has(role)) {
    return items.filter((n) => !isHrLeaveSubmittedNotification(n));
  }

  if (REVIEWER_ROLES.has(role)) {
    return items.filter((n) =>
      !isEmployeeLeaveStatusNotification(n)
      && !isPersonalAssigneeNotification(n),
    );
  }

  return items;
}
