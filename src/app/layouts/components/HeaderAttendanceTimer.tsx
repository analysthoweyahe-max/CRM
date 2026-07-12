import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { useWorkTimer } from '@/shared/modules/attendance/hooks/useWorkTimer';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import { formatWorkingHours, workStatusStyle } from '@/shared/modules/attendance/utils/attendanceTimer.utils';
import type { AttendanceScope } from '@/shared/modules/attendance/types/attendanceTimer.types';

interface HeaderAttendanceTimerProps {
  layoutScope?: AttendanceScope;
}

/** Compact header pill for the work timer — expands into the full check-in/out card on click. */
export function HeaderAttendanceTimer({ layoutScope }: HeaderAttendanceTimerProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { today, displayHours, isActiveDay, isLoading } = useWorkTimer({
    layoutScope,
    enabled: !isSuperAdmin,
  });

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  if (isSuperAdmin) return null;

  if (isLoading && !today) {
    return <div className="h-8 w-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }

  const isPaused = Boolean(today?.isPaused || today?.workStatus === 'on_break');
  const status = isPaused ? 'on_break' : (today?.workStatus ?? 'offline');
  const style = workStatusStyle(status);
  const timerText = formatWorkingHours(displayHours ?? today?.workingHours ?? null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        aria-label={isAr ? 'مؤقت الحضور' : 'Work timer'}
        className={[
          'flex items-center gap-2 rounded-full ps-3 pe-2.5 py-1.5 border transition-colors',
          isActiveDay
            ? 'border-[#A0CD39]/40 bg-[#D8EBAE]/30 dark:bg-[#A0CD39]/10 dark:border-[#A0CD39]/25'
            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
        ].join(' ')}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {isActiveDay && !isPaused && (
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${style.dot}`} />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${isActiveDay ? style.dot : 'bg-gray-300 dark:bg-gray-600'}`} />
        </span>
        <Clock size={14} className="text-[#709028] dark:text-[#A0CD39] shrink-0" />
        <span className="font-mono text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-200 hidden sm:inline">
          {isActiveDay ? timerText : (isAr ? 'تسجيل حضور' : 'Check In')}
        </span>
      </button>

      {open && (
        <div className="absolute inset-e-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] z-50 [&>div]:shadow-xl">
          <WorkTimerCard variant="card" layoutScope={layoutScope} showExceptionLink />
        </div>
      )}
    </div>
  );
}
