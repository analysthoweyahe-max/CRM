import { useNavigate } from 'react-router-dom';
import { Users, Clock, CalendarDays, UserCheck, UserX } from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import type { DashboardStats } from '../hooks/useDashboard';

interface Props {
  isAr:  boolean;
  stats: DashboardStats;
}

export function StatCards({ isAr, stats }: Props) {
  const navigate = useNavigate();

  const CARDS = [
    {
      labelAr: 'إجمالي الموظفين', labelEn: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users, color: 'text-brand-600', bg: 'bg-brand-50',
      path: ROUTES.EMPLOYEES.LIST,
    },
    {
      labelAr: 'الموظفون النشطون', labelEn: 'Active Employees',
      value: stats.activeCount,
      icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-50',
      path: ROUTES.EMPLOYEES.LIST,
    },
    {
      labelAr: 'غير النشطين', labelEn: 'Inactive',
      value: stats.inactiveCount,
      icon: UserX, color: 'text-red-400', bg: 'bg-red-50',
      path: ROUTES.EMPLOYEES.LIST,
    },
    {
      labelAr: 'نسبة الحضور', labelEn: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50',
      path: ROUTES.ATTENDANCE.DAILY,
    },
    {
      labelAr: 'إجازات معلقة', labelEn: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: CalendarDays, color: 'text-violet-500', bg: 'bg-violet-50',
      path: ROUTES.LEAVES.LIST,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        return (
          <button
            key={card.labelEn}
            type="button"
            onClick={() => navigate(card.path)}
            style={{ animationDelay: `${i * 0.08}s` }}
            className="fade-in-up group relative flex flex-col items-center text-center
                       rounded-2xl border border-gray-100 dark:border-gray-700
                       bg-white dark:bg-gray-800 px-4 pt-5 pb-4 shadow-sm
                       hover:-translate-y-1 hover:shadow-lg hover:border-gray-200
                       dark:hover:border-gray-600 transition-all duration-300 cursor-pointer"
          >
            <div className={`${card.bg} rounded-2xl p-3.5 mb-3
                             group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={22} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none mb-1.5">
              {card.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
              {isAr ? card.labelAr : card.labelEn}
            </p>
          </button>
        );
      })}
    </div>
  );
}
