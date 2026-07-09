import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import { Card }   from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge }  from '@/shared/components/ui/Badge';
import { formatDateShort } from '@/shared/utils/date.utils';
import type { ApiEmployee } from '@/modules/hr/employees/types/employee.types';
import type { ApiLeaveRequest } from '@/modules/hr/leaves/types/leaves.types';
import { LEAVE_STATUS_CFG } from '@/modules/hr/leaves/types/leaves.types';
import {
  formatLeaveDuration,
  getLeaveEmployeeName,
} from '@/modules/hr/leaves/utils/leave.utils';

const AVATAR_COLORS = [
  'bg-pink-500', 'bg-violet-500', 'bg-orange-500',
  'bg-green-500', 'bg-teal-500',  'bg-blue-500',
];
function empColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

interface Props {
  isAr:            boolean;
  recentEmployees: ApiEmployee[];
  recentLeaves:    ApiLeaveRequest[];
}

function SectionCard({
  title, action, badge, delay, children,
}: {
  title:    string;
  action?:  ReactElement;
  badge?:   ReactElement;
  delay:    string;
  children: ReactElement | ReactElement[];
}) {
  return (
    <Card overflow className="fade-in-up" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {action ?? badge}
      </div>
      <ul className="divide-y divide-gray-50 dark:divide-gray-700/40">{children}</ul>
    </Card>
  );
}

export function RecentData({ isAr, recentEmployees, recentLeaves }: Props) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Recent Employees */}
        <SectionCard
          title={isAr ? 'أحدث الموظفين' : 'Recent Employees'}
          delay="0.05s"
          action={
            <button type="button" onClick={() => navigate(ROUTES.EMPLOYEES.LIST)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
              {isAr ? 'عرض الكل' : 'View All'}
            </button>
          }
        >
          {recentEmployees.length === 0 ? (
            <li className="px-5 py-6 text-center text-xs text-gray-400">
              {isAr ? 'لا توجد بيانات' : 'No data'}
            </li>
          ) : recentEmployees.map((emp) => (
            <li key={emp.id}
              className="flex items-center gap-3 px-5 py-3
                         hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <Avatar initial={emp.name.charAt(0).toUpperCase()} color={empColor(emp.name)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{emp.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {emp.jobTitle?.name ?? (isAr ? 'لا يوجد مسمى' : 'No title')}
                  {emp.department ? ` · ${isAr ? (emp.department.nameAr ?? emp.department.name) : emp.department.name}` : ''}
                </p>
              </div>
              <Badge
                label={emp.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                variant={emp.status === 'active' ? 'success' : 'error'}
              />
            </li>
          ))}
        </SectionCard>

        {/* Pending Leaves Notifications */}
        <SectionCard
          title={isAr ? 'طلبات الإجازات الأخيرة' : 'Latest Leave Requests'}
          delay="0.12s"
          badge={
            recentLeaves.length > 0 ? (
              <span className="text-xs bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400
                               font-bold px-2 py-0.5 rounded-full">
                {recentLeaves.length}
              </span>
            ) : undefined
          }
        >
          {recentLeaves.length === 0 ? (
            <li className="px-5 py-6 text-center text-xs text-gray-400">
              {isAr ? 'لا توجد طلبات' : 'No requests'}
            </li>
          ) : recentLeaves.map((leave) => {
            const employeeName = getLeaveEmployeeName(leave) || (isAr ? 'موظف' : 'Employee');
            const statusCfg = LEAVE_STATUS_CFG[leave.status];
            const periodLabel = leave.start_date && leave.end_date
              ? `${formatDateShort(leave.start_date, isAr)} – ${formatDateShort(leave.end_date, isAr)}`
              : null;
            return (
            <li key={leave.id}
              className="flex items-start gap-3 px-5 py-3 cursor-pointer
                         hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              onClick={() => navigate(ROUTES.LEAVES.DETAIL(leave.id))}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(ROUTES.LEAVES.DETAIL(leave.id)); }}
              role="button"
              tabIndex={0}
            >
              <div className="bg-amber-50 dark:bg-amber-900/20 mt-0.5 rounded-lg p-1.5 shrink-0">
                <CalendarDays size={13} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {employeeName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {(leave.leave_type_label || leave.leave_type || (isAr ? 'إجازة' : 'Leave'))}
                  {periodLabel ? ` · ${periodLabel}` : ''}
                  {leave.days_count ? ` · ${formatLeaveDuration(leave.days_count, isAr)}` : ''}
                </p>
                {leave.request_date && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    {isAr ? 'تاريخ الطلب:' : 'Requested:'} {formatDateShort(leave.request_date, isAr)}
                  </p>
                )}
              </div>
              {statusCfg && (
              <Badge
                label={isAr ? statusCfg.labelAr : statusCfg.labelEn}
                variant={
                  leave.status === 'approved' ? 'success'
                  : leave.status === 'rejected' ? 'error'
                  : 'warning'
                }
              />
              )}
            </li>
          );})}
        </SectionCard>

      </div>
    </div>
  );
}
