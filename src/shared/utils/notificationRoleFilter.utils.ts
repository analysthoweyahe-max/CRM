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

const REVIEWER_ROLES = new Set<Role>(['admin', 'hr']);
const EMPLOYEE_ROLES = new Set<Role>(['employee', 'seo-member']);

/** Hide notifications that were routed to the wrong role by the backend. */
export function filterNotificationsForRole(
  items: AppNotification[],
  role: Role | undefined,
): AppNotification[] {
  if (!role) return items;

  if (REVIEWER_ROLES.has(role)) {
    return items.filter((n) => !isEmployeeLeaveStatusNotification(n));
  }

  if (EMPLOYEE_ROLES.has(role)) {
    return items.filter((n) => !isHrLeaveSubmittedNotification(n));
  }

  return items;
}
