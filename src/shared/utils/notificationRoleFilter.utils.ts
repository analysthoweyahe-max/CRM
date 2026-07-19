import type { AppNotification } from '@/shared/types/notification.types';
import type { Role } from '@/shared/types/role.types';

/** Employee-facing leave/exception status updates — must not appear for HR/admin reviewers. */
export function isEmployeeLeaveStatusNotification(notification: AppNotification): boolean {
  const type = notification.type ?? '';
  if (
    type === 'leave'
    || type === 'hr_leave_status_updated'
    || type === 'hr_attendance_exception_status_updated'
  ) {
    return true;
  }

  const haystack = `${notification.title} ${notification.body}`.toLowerCase();
  return /إجازتك|your leave|leave status|حالة إجازتك|حالة طلب إجازتك|استثناءك|your attendance exception|exception status/.test(haystack);
}

/** HR/admin reviewer alerts when an employee submits leave or an attendance exception. */
export function isHrLeaveSubmittedNotification(notification: AppNotification): boolean {
  const type = notification.type ?? '';
  return type === 'hr_leave_submitted' || type === 'hr_attendance_exception_submitted';
}

/** Personal "assigned to you" alerts — for the assignee only.
 * Admin/HR mirrors must not show these as if they were the recipient.
 * PM managers and SEO leaders receive these on their own portals and should keep them.
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

/** Admin/HR only — hide employee-personal noise that can leak into reviewer inboxes. */
const ADMIN_REVIEWER_ROLES = new Set<Role>(['admin', 'hr']);
/** Portal managers — keep assignment alerts; still hide employee leave-status updates. */
const PORTAL_MANAGER_ROLES = new Set<Role>(['manager', 'seo-leader']);
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

  if (ADMIN_REVIEWER_ROLES.has(role)) {
    return items.filter((n) =>
      !isEmployeeLeaveStatusNotification(n)
      && !isPersonalAssigneeNotification(n),
    );
  }

  if (PORTAL_MANAGER_ROLES.has(role)) {
    return items.filter((n) => !isEmployeeLeaveStatusNotification(n));
  }

  return items;
}
