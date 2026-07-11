import { ROUTES } from '@/app/router/routes';
import { resolveAttendanceScope } from '@/shared/modules/attendance/utils/attendanceTimer.utils';
import { utcClockToLocal } from '@/shared/utils/date.utils';
import type { Role } from '@/shared/types/role.types';
import type { WorkAppRoutes, WorkScope } from '../types/workOverview.types';

export { resolveAttendanceScope as resolveWorkScope };

const SCOPE_BASE: Record<WorkScope, string> = {
  employee: '/v1/employee',
  pm:       '/v1/pm',
  seo:      '/v1/seo',
};

export function workScopeBase(scope: WorkScope): string {
  return SCOPE_BASE[scope];
}

export function workOverviewPath(scope: WorkScope): string {
  return `${SCOPE_BASE[scope]}/work-overview`;
}

export function personalDeductionsPath(scope: WorkScope): string {
  return `${SCOPE_BASE[scope]}/deductions`;
}

export function personalDeductionPath(scope: WorkScope, id: string): string {
  return `${SCOPE_BASE[scope]}/deductions/${id}`;
}

export function personalBonusesPath(scope: WorkScope): string {
  return `${SCOPE_BASE[scope]}/bonuses`;
}

export function personalBonusPath(scope: WorkScope, id: string): string {
  return `${SCOPE_BASE[scope]}/bonuses/${id}`;
}

/** API may return UTC HH:mm:ss — show local HH:mm in UI. */
export function formatTimeHHmm(time: string | null | undefined): string {
  const local = utcClockToLocal(time);
  if (!local) return '--:--';
  const [h, m] = local.split(':');
  if (h == null || m == null || Number.isNaN(Number(h))) return '--:--';
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

export function formatMoney(amount: number, isAr: boolean): string {
  const formatted = amount.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${isAr ? 'ج.م' : 'EGP'}`;
}

export function formatWorkHours(hours: number | null | undefined): string {
  if (hours == null || Number.isNaN(hours)) return '—';
  return hours.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthOptions(isAr: boolean): { id: string; label: string }[] {
  const items: { id: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
    items.push({ id, label });
  }
  return items;
}

export function getWorkAppRoutes(scope: WorkScope): WorkAppRoutes {
  switch (scope) {
    case 'pm':
      return {
        overview:        ROUTES.PROJECT_MANAGER.WORK_OVERVIEW,
        attendance:      ROUTES.PROJECT_MANAGER.ATTENDANCE,
        deductions:      ROUTES.PROJECT_MANAGER.DEDUCTIONS,
        deductionDetail: ROUTES.PROJECT_MANAGER.DEDUCTION_DETAIL,
        bonuses:         ROUTES.PROJECT_MANAGER.BONUSES,
        bonusDetail:     ROUTES.PROJECT_MANAGER.BONUS_DETAIL,
      };
    case 'seo':
      // SEO leader vs member is resolved by which layout mounts the page;
      // callers pass layoutScope and we pick leader routes by default when
      // role is seo-leader. For seo-member layoutScope pages use member routes.
      return getSeoWorkRoutes('leader');
    case 'employee':
    default:
      return {
        overview:        ROUTES.EMPLOYEE.WORK_OVERVIEW,
        attendance:      ROUTES.EMPLOYEE.ATTENDANCE,
        deductions:      ROUTES.EMPLOYEE.DEDUCTIONS,
        deductionDetail: ROUTES.EMPLOYEE.DEDUCTION_DETAIL,
        bonuses:         ROUTES.EMPLOYEE.BONUSES,
        bonusDetail:     ROUTES.EMPLOYEE.BONUS_DETAIL,
      };
  }
}

export function getSeoWorkRoutes(variant: 'leader' | 'member'): WorkAppRoutes {
  if (variant === 'member') {
    return {
      overview:        ROUTES.SEO_MEMBER.WORK_OVERVIEW,
      attendance:      ROUTES.SEO_MEMBER.ATTENDANCE,
      deductions:      ROUTES.SEO_MEMBER.DEDUCTIONS,
      deductionDetail: ROUTES.SEO_MEMBER.DEDUCTION_DETAIL,
      bonuses:         ROUTES.SEO_MEMBER.BONUSES,
      bonusDetail:     ROUTES.SEO_MEMBER.BONUS_DETAIL,
    };
  }
  return {
    overview:        ROUTES.SEO_LEADER.WORK_OVERVIEW,
    attendance:      ROUTES.SEO_LEADER.ATTENDANCE,
    deductions:      ROUTES.SEO_LEADER.DEDUCTIONS,
    deductionDetail: ROUTES.SEO_LEADER.DEDUCTION_DETAIL,
    bonuses:         ROUTES.SEO_LEADER.BONUSES,
    bonusDetail:     ROUTES.SEO_LEADER.BONUS_DETAIL,
  };
}

export function resolveWorkAppRoutes(
  scope: WorkScope,
  role?: Role,
  routeVariant?: 'leader' | 'member',
): WorkAppRoutes {
  if (scope === 'seo') {
    if (routeVariant) return getSeoWorkRoutes(routeVariant);
    if (role === 'seo-member') return getSeoWorkRoutes('member');
    return getSeoWorkRoutes('leader');
  }
  return getWorkAppRoutes(scope);
}

export function dayStatusBadgeClass(status: string): string {
  switch (status) {
    case 'present':
      return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    case 'late':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'absent':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    case 'leave':
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400';
    case 'holiday':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}
