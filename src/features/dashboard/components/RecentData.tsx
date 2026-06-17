import { useNavigate } from 'react-router-dom';
import { CalendarDays, MessageSquare } from 'lucide-react';
import { ROUTES } from '@/app/router/routes';

/* ── Data ─────────────────────────────────────────────────────────── */
const RECENT_EMPLOYEES = [
  { name: 'سارة حلمي',    role: 'مطور خلفي',          dept: 'التصميم',      initial: 'س', color: 'bg-pink-500' },
  { name: 'باسم الشريف',  role: 'مطور واجهات أمامية',  dept: 'العمليات',     initial: 'ب', color: 'bg-violet-500' },
  { name: 'ملك رشدي',    role: 'مصمم منتجات',        dept: 'التسويق',      initial: 'م', color: 'bg-orange-500' },
  { name: 'محمد فؤاد',   role: 'ممثل خدمة عملاء',     dept: 'خدمة العملاء', initial: 'م', color: 'bg-green-500' },
  { name: 'فاطمة الشريف', role: 'أخصائي تسويق',      dept: 'العمليات',     initial: 'ف', color: 'bg-teal-500' },
];

const NOTIFICATIONS = [
  { icon: CalendarDays,  color: 'text-amber-600',  bg: 'bg-amber-50',  titleAr: 'طلب إجازة جديد', titleEn: 'New Leave Request', descAr: 'قام أحمد الشريف بطلب إجازة سنوية بانتظار المراجعة', descEn: 'Ahmed requested annual leave — pending review', time: '09:20 ص' },
  { icon: CalendarDays,  color: 'text-amber-600',  bg: 'bg-amber-50',  titleAr: 'طلب إجازة جديد', titleEn: 'New Leave Request', descAr: 'قام أحمد الشريف بطلب إجازة سنوية بانتظار المراجعة', descEn: 'Ahmed requested annual leave — pending review', time: '09:20 ص' },
  { icon: MessageSquare, color: 'text-brand-600',  bg: 'bg-brand-50',  titleAr: 'رسالة جديدة',    titleEn: 'New Message',       descAr: 'لديك رسالة جديدة من سارة منصور',                     descEn: 'You have a new message from Sara Mansour',    time: '09:20 ص' },
  { icon: CalendarDays,  color: 'text-amber-600',  bg: 'bg-amber-50',  titleAr: 'طلب إجازة جديد', titleEn: 'New Leave Request', descAr: 'قام أحمد الشريف بطلب إجازة سنوية بانتظار المراجعة', descEn: 'Ahmed requested annual leave — pending review', time: '09:20 ص' },
];

const STATUS_STYLES = {
  pending:  { ar: 'معلقة',      en: 'Pending',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { ar: 'موافق عليها', en: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { ar: 'مرفوضة',     en: 'Rejected', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
} as const;
type LeaveStatus = keyof typeof STATUS_STYLES;

const RECENT_LEAVES: { name: string; role: string; dept: string; initial: string; color: string; status: LeaveStatus }[] = [
  { name: 'سارة حلمي',    role: 'مطور خلفي',         dept: 'التصميم',  initial: 'س', color: 'bg-pink-500',   status: 'pending' },
  { name: 'ملك رشدي',    role: 'مصمم منتجات',       dept: 'التسويق',  initial: 'م', color: 'bg-orange-500', status: 'approved' },
  { name: 'فاطمة الشريف', role: 'أخصائي تسويق',     dept: 'العمليات', initial: 'ف', color: 'bg-teal-500',   status: 'rejected' },
  { name: 'فاطمة الشريف', role: 'أخصائي تسويق',     dept: 'العمليات', initial: 'ف', color: 'bg-teal-500',   status: 'pending' },
  { name: 'باسم الشريف',  role: 'مطور واجهات أمامية', dept: 'العمليات', initial: 'ب', color: 'bg-violet-500', status: 'approved' },
];

/* ── Component ─────────────────────────────────────────────────────── */
export function RecentData({ isAr }: { isAr: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">

      {/* Recent Employees + Notifications */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Recent Employees */}
        <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
             style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isAr ? 'أحدث الموظفين' : 'Recent Employees'}
            </h3>
            <button type="button" onClick={() => navigate(ROUTES.EMPLOYEES.LIST)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
              {isAr ? 'عرض الكل' : 'View All'}
            </button>
          </div>
          <ul className="divide-y divide-gray-50 dark:divide-gray-700/40">
            {RECENT_EMPLOYEES.map((emp, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3
                                     hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className={`${emp.color} w-8 h-8 rounded-full flex items-center justify-center shrink-0`}>
                  <span className="text-xs font-bold text-white">{emp.initial}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{emp.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{emp.role} · {emp.dept}</p>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0
                                 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {isAr ? 'نشط' : 'Active'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notifications */}
        <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
             style={{ animationDelay: '0.12s' }}>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isAr ? 'الإشعارات' : 'Notifications'}
            </h3>
            <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400
                             font-bold px-2 py-0.5 rounded-full">
              {NOTIFICATIONS.length}
            </span>
          </div>
          <ul className="divide-y divide-gray-50 dark:divide-gray-700/40">
            {NOTIFICATIONS.map((n, i) => {
              const Icon = n.icon;
              return (
                <li key={i} className="flex items-start gap-3 px-5 py-3
                                       hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className={`${n.bg} mt-0.5 rounded-lg p-1.5 shrink-0`}>
                    <Icon size={13} className={n.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {isAr ? n.titleAr : n.titleEn}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {isAr ? n.descAr : n.descEn}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="fade-in-up rounded-2xl border border-gray-100 dark:border-gray-700
                      bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
           style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isAr ? 'أحدث طلبات الإجازات' : 'Recent Leave Requests'}
          </h3>
          <button type="button" onClick={() => navigate(ROUTES.LEAVES)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
            {isAr ? 'عرض الكل' : 'View All'}
          </button>
        </div>
        <ul className="divide-y divide-gray-50 dark:divide-gray-700/40">
          {RECENT_LEAVES.map((leave, i) => {
            const s = STATUS_STYLES[leave.status];
            return (
              <li key={i} className="flex items-center gap-3 px-5 py-3
                                     hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className={`${leave.color} w-8 h-8 rounded-full flex items-center justify-center shrink-0`}>
                  <span className="text-xs font-bold text-white">{leave.initial}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{leave.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{leave.role} · {leave.dept}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>
                  {isAr ? s.ar : s.en}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
