import { Clock } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { Button }  from '@/shared/components/ui/Button';

export function AttendanceWidget() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/60 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-[#709028] shrink-0" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
          {isAr ? 'تسجيل الحضور' : 'Attendance'}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
            {isAr ? 'الحالة' : 'Status'}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {isAr ? 'لم يتم تسجيل الدخول' : 'Not checked in'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
            {isAr ? 'وقت بداية اليوم' : 'Start time'}
          </span>
          <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">--:--</span>
        </div>
      </div>

      <Button size="sm" fullWidth>
        {isAr ? 'تسجيل حضور' : 'Check In'}
      </Button>
    </div>
  );
}
