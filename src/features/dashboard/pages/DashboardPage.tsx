import {
  Users,
  Clock,
  CalendarDays,
  Banknote,
  TrendingUp,
  TrendingDown,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';

interface StatCard {
  labelAr: string;
  labelEn: string;
  value:   string;
  icon:    React.ElementType;
  color:   string;
  bg:      string;
  trendUp: boolean;
  trendAr: string;
  trendEn: string;
}

const STATS: StatCard[] = [
  {
    labelAr: 'إجمالي الموظفين',
    labelEn: 'Total Employees',
    value: '124',
    icon: Users,
    color: 'text-brand-600',
    bg: 'bg-brand-50',
    trendUp: true,
    trendAr: '+3 هذا الشهر',
    trendEn: '+3 this month',
  },
  {
    labelAr: 'الحاضرون اليوم',
    labelEn: 'Present Today',
    value: '108',
    icon: UserCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    trendUp: true,
    trendAr: '87% نسبة الحضور',
    trendEn: '87% attendance rate',
  },
  {
    labelAr: 'طلبات الإجازة',
    labelEn: 'Leave Requests',
    value: '7',
    icon: CalendarDays,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    trendUp: false,
    trendAr: '4 بانتظار الموافقة',
    trendEn: '4 pending approval',
  },
  {
    labelAr: 'رواتب الشهر',
    labelEn: 'Monthly Payroll',
    value: '248,500 ر.س',
    icon: Banknote,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    trendUp: true,
    trendAr: '+2.4% عن الشهر الماضي',
    trendEn: '+2.4% vs last month',
  },
];

interface ActivityItem {
  icon:    React.ElementType;
  color:   string;
  bg:      string;
  textAr:  string;
  textEn:  string;
  timeAr:  string;
  timeEn:  string;
}

const ACTIVITY: ActivityItem[] = [
  {
    icon: Users,
    color: 'text-brand-600',
    bg: 'bg-brand-50',
    textAr: 'تم إضافة موظف جديد: أحمد محمد',
    textEn: 'New employee added: Ahmed Mohamed',
    timeAr: 'منذ 10 دقائق',
    timeEn: '10 minutes ago',
  },
  {
    icon: CalendarDays,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    textAr: 'طلب إجازة جديد بانتظار الموافقة',
    textEn: 'New leave request pending approval',
    timeAr: 'منذ 35 دقيقة',
    timeEn: '35 minutes ago',
  },
  {
    icon: Clock,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    textAr: 'تم تسجيل الحضور لـ 108 موظف',
    textEn: '108 employees checked in',
    timeAr: 'منذ ساعة',
    timeEn: '1 hour ago',
  },
  {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    textAr: 'غياب غير مبرر: 3 موظفين',
    textEn: 'Unexcused absence: 3 employees',
    timeAr: 'اليوم، 9:00 ص',
    timeEn: 'Today, 9:00 AM',
  },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const greeting = isAr
    ? `مرحباً، ${user?.fullName ?? 'مستخدم'} 👋`
    : `Welcome, ${user?.fullName ?? 'User'} 👋`;

  const subtext = isAr
    ? 'إليك ملخص يوم العمل'
    : "Here's your work day summary";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{greeting}</h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtext}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const Trend = stat.trendUp ? TrendingUp : TrendingDown;
          const trendColor = stat.trendUp ? 'text-emerald-600' : 'text-red-500';

          return (
            <div
              key={stat.labelEn}
              className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {isAr ? stat.labelAr : stat.labelEn}
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bg} rounded-xl p-2.5`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                <Trend size={13} />
                <span>{isAr ? stat.trendAr : stat.trendEn}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-700 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isAr ? 'آخر النشاطات' : 'Recent Activity'}
          </h3>
        </div>
        <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {ACTIVITY.map((item, i) => {
            const Icon = item.icon;
            return (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`${item.bg} mt-0.5 rounded-lg p-1.5 shrink-0`}>
                  <Icon size={14} className={item.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {isAr ? item.textAr : item.textEn}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {isAr ? item.timeAr : item.timeEn}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
