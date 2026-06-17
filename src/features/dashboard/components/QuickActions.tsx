import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, CalendarDays, Plus } from 'lucide-react';
import { ROUTES } from '@/app/router/routes';

const QUICK_ACTIONS = [
  { labelAr: 'الرسائل',          labelEn: 'Messages',         icon: MessageSquare, color: 'text-brand-600',   bg: 'bg-brand-50',   path: ROUTES.MESSAGES },
  { labelAr: 'سجل الحضور اليومي', labelEn: 'Daily Attendance', icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-50',   path: ROUTES.ATTENDANCE.DAILY },
  { labelAr: 'طلبات الإجازات',   labelEn: 'Leave Requests',   icon: CalendarDays,  color: 'text-violet-500',  bg: 'bg-violet-50',  path: ROUTES.LEAVES },
  { labelAr: 'إضافة موظف',       labelEn: 'Add Employee',     icon: Plus,          color: 'text-emerald-600', bg: 'bg-emerald-50', path: ROUTES.EMPLOYEES.NEW },
] as const;

export function QuickActions({ isAr }: { isAr: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {QUICK_ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <button
            key={action.labelEn}
            type="button"
            onClick={() => navigate(action.path)}
            style={{ animationDelay: `${i * 0.07}s` }}
            className="fade-in-up group flex items-center justify-between
                       rounded-2xl border border-gray-100 dark:border-gray-700
                       bg-white dark:bg-gray-800 px-5 py-4 shadow-sm
                       hover:-translate-y-1 hover:shadow-lg hover:border-gray-200
                       dark:hover:border-gray-600 transition-all duration-300 cursor-pointer"
          >
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">
              {isAr ? action.labelAr : action.labelEn}
            </span>
            <div className={`${action.bg} rounded-2xl p-3 shrink-0 ms-3
                            group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={22} className={action.color} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
