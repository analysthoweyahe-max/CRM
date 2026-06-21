import { useNavigate } from 'react-router-dom';
import { Users, Clock, CalendarDays, UserCheck, UserX, TrendingUp, TrendingDown } from 'lucide-react';
import { ROUTES } from '@/app/router/routes';

const STATS = [
  {
    labelAr: 'إجمالي الموظفين', labelEn: 'Total Employees',
    value: '24', icon: Users,
    color: 'text-brand-600', bg: 'bg-brand-50',
    trendUp: true, trendAr: '+4%', trendEn: '+4%',
    path: ROUTES.EMPLOYEES.LIST,
  },
  {
    labelAr: 'الموظفون النشطون', labelEn: 'Active Employees',
    value: '19', icon: UserCheck,
    color: 'text-blue-500', bg: 'bg-blue-50',
    trendUp: null, trendAr: '', trendEn: '',
    path: ROUTES.EMPLOYEES.LIST,
  },
  {
    labelAr: 'غير النشطين', labelEn: 'Inactive',
    value: '5', icon: UserX,
    color: 'text-red-400', bg: 'bg-red-50',
    trendUp: null, trendAr: '', trendEn: '',
    path: ROUTES.EMPLOYEES.LIST,
  },
  {
    labelAr: 'نسبة الحضور', labelEn: 'Attendance Rate',
    value: '74%', icon: Clock,
    color: 'text-amber-500', bg: 'bg-amber-50',
    trendUp: true, trendAr: '+2%', trendEn: '+2%',
    path: ROUTES.ATTENDANCE.DAILY,
  },
  {
    labelAr: 'إجازات معلقة', labelEn: 'Pending Leaves',
    value: '6', icon: CalendarDays,
    color: 'text-violet-500', bg: 'bg-violet-50',
    trendUp: null, trendAr: '', trendEn: '',
    path: ROUTES.LEAVES.LIST,
  },
] as const;

export function StatCards({ isAr }: { isAr: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        const hasTrend = stat.trendUp !== null && (isAr ? stat.trendAr : stat.trendEn);

        return (
          <button
            key={stat.labelEn}
            type="button"
            onClick={() => navigate(stat.path)}
            style={{ animationDelay: `${i * 0.08}s` }}
            className="fade-in-up group relative flex flex-col items-center text-center
                       rounded-2xl border border-gray-100 dark:border-gray-700
                       bg-white dark:bg-gray-800 px-4 pt-5 pb-4 shadow-sm
                       hover:-translate-y-1 hover:shadow-lg hover:border-gray-200
                       dark:hover:border-gray-600 transition-all duration-300 cursor-pointer"
          >
            {/* Trend badge */}
            {hasTrend && (
              <span className={`absolute top-3 start-3 flex items-center gap-0.5 text-[11px] font-bold
                               ${stat.trendUp ? 'text-emerald-500' : 'text-red-400'}`}>
                {stat.trendUp
                  ? <TrendingUp size={11} />
                  : <TrendingDown size={11} />}
                {isAr ? stat.trendAr : stat.trendEn}
              </span>
            )}

            {/* Icon */}
            <div className={`${stat.bg} rounded-2xl p-3.5 mb-3
                            group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={22} className={stat.color} />
            </div>

            {/* Value */}
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none mb-1.5">
              {stat.value}
            </p>

            {/* Label */}
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
              {isAr ? stat.labelAr : stat.labelEn}
            </p>
          </button>
        );
      })}
    </div>
  );
}
