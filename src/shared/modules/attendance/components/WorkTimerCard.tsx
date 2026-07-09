import { useState } from 'react';
import { Clock, LogIn, LogOut, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { extractApiError } from '@/shared/utils/error.utils';
import { useWorkTimer, type UseWorkTimerOptions } from '../hooks/useWorkTimer';
import {
  formatBreakMinutes,
  formatClockTime,
  formatWorkingHours,
  workStatusStyle,
} from '../utils/attendanceTimer.utils';

type ConfirmAction = 'check-in' | 'check-out' | 'pause' | 'resume';

export interface WorkTimerCardProps extends UseWorkTimerOptions {
  variant?: 'compact' | 'card';
  className?: string;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function WorkTimerCard({
  variant = 'card',
  className = '',
  ...timerOptions
}: WorkTimerCardProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const timer = useWorkTimer(timerOptions);
  const {
    today, displayHours, breakElapsed, isLoading, isActiveDay,
    isCheckingIn, isCheckingOut, isPausing, isResuming,
    checkIn, checkOut, pause, resume,
  } = timer;

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  if (isLoading && !today) {
    return (
      <div className={`animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 ${variant === 'compact' ? 'h-32 mx-3 mb-3' : 'h-48'} ${className}`} />
    );
  }

  const status = today?.workStatus ?? 'offline';
  const style  = workStatusStyle(status);
  const statusLabel = today?.workStatusLabel
    ?? (status === 'currently_working'
      ? (isAr ? 'يعمل حاليًا' : 'Currently working')
      : status === 'on_break'
        ? (isAr ? 'في استراحة' : 'On break')
        : (isAr ? 'غير متصل' : 'Offline'));

  const checkInTime = today?.record?.checkInTime ?? today?.checkInTime ?? null;
  const breakMinutes = today?.breakMinutes ?? 0;
  const timerText = formatWorkingHours(displayHours ?? today?.workingHours ?? null);
  const isCompact = variant === 'compact';

  function handleSuccess(msgAr: string, msgEn: string) {
    setConfirmAction(null);
    toast.success(isAr ? msgAr : msgEn);
  }

  function handleError(err: unknown, fallbackAr: string, fallbackEn: string) {
    toast.error(extractApiError(err) || (isAr ? fallbackAr : fallbackEn));
  }

  function executeAction() {
    switch (confirmAction) {
      case 'check-in':
        checkIn(
          () => handleSuccess('تم تسجيل الحضور', 'Checked in successfully'),
          (err) => handleError(err, 'فشل تسجيل الحضور', 'Check-in failed'),
        );
        break;
      case 'check-out':
        checkOut(
          () => handleSuccess('تم تسجيل الانصراف، طاب يومك 👋', 'Checked out, have a great day!'),
          (err) => handleError(err, 'فشل تسجيل الانصراف', 'Check-out failed'),
        );
        break;
      case 'pause':
        pause(
          () => handleSuccess('تم إيقاف المؤقت مؤقتاً', 'Timer paused'),
          (err) => handleError(err, 'فشل الإيقاف المؤقت', 'Pause failed'),
        );
        break;
      case 'resume':
        resume(
          () => handleSuccess('تم استئناف العمل', 'Work resumed'),
          (err) => handleError(err, 'فشل الاستئناف', 'Resume failed'),
        );
        break;
    }
  }

  const shell = isCompact
    ? 'mx-3 mb-3 rounded-2xl border border-[#A0CD39]/40 bg-[#D8EBAE]/30 dark:bg-[#A0CD39]/5 dark:border-[#A0CD39]/20 p-3 space-y-2.5'
    : 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm space-y-4';

  const confirmTitles: Record<ConfirmAction, { ar: string; en: string }> = {
    'check-in':  { ar: 'تسجيل الحضور', en: 'Check In' },
    'check-out': { ar: 'تسجيل الانصراف', en: 'Check Out' },
    'pause':     { ar: 'إيقاف مؤقت', en: 'Pause' },
    'resume':    { ar: 'استئناف العمل', en: 'Resume' },
  };

  const confirmDesc: Record<ConfirmAction, { ar: string; en: string }> = {
    'check-in':  { ar: 'هل تريد بدء يوم العمل الآن؟', en: 'Start your work day now?' },
    'check-out': { ar: 'هل تريد تسجيل الانصراف الآن؟', en: 'Check out now?' },
    'pause':     { ar: 'هل تريد إيقاف المؤقت مؤقتاً؟', en: 'Pause the timer?' },
    'resume':    { ar: 'هل تريد استئناف العد؟', en: 'Resume counting?' },
  };

  const isPending = isCheckingIn || isCheckingOut || isPausing || isResuming;

  return (
    <div className={`${shell} ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock size={isCompact ? 14 : 18} className="text-[#709028] dark:text-[#A0CD39] shrink-0" />
        <span className={`font-semibold text-gray-700 dark:text-gray-300 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {isAr ? 'مؤقت الحضور' : 'Work Timer'}
        </span>
      </div>

      {/* Timer display */}
      <div className={`text-center ${isCompact ? 'rounded-xl bg-white/80 dark:bg-gray-800/60 px-3 py-2' : ''}`}>
        <p className={`font-mono font-bold text-gray-900 dark:text-gray-100 tracking-widest tabular-nums ${isCompact ? 'text-[17px]' : 'text-3xl'}`}>
          {timerText}
        </p>
        <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {statusLabel}
        </div>
        {today?.isPaused && breakElapsed > 0 && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
            {isAr ? `مدة الاستراحة: ${formatElapsed(breakElapsed)}` : `Break: ${formatElapsed(breakElapsed)}`}
          </p>
        )}
      </div>

      {/* Meta row */}
      {(isActiveDay || today?.record?.checkOutTime) && (
        <div className={`flex items-center justify-between gap-3 text-gray-500 dark:text-gray-400 ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
          <span>
            {isAr ? 'حضور:' : 'In:'}{' '}
            <span className="font-mono">{formatClockTime(checkInTime, isAr)}</span>
          </span>
          <span>
            {isAr ? 'استراحة:' : 'Break:'}{' '}
            <span className="font-medium">{formatBreakMinutes(breakMinutes, isAr)}</span>
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className={`flex gap-2 ${isCompact ? 'flex-col' : 'flex-wrap'}`}>
        {today?.canCheckIn && (
          <Button
            size="sm"
            fullWidth
            startIcon={<LogIn size={13} />}
            onClick={() => setConfirmAction('check-in')}
            isLoading={isCheckingIn}
          >
            {isAr ? 'تسجيل حضور' : 'Check In'}
          </Button>
        )}
        {today?.canPause && (
          <Button
            size="sm"
            fullWidth
            variant="secondary"
            startIcon={<Pause size={13} />}
            onClick={() => setConfirmAction('pause')}
            isLoading={isPausing}
          >
            {isAr ? 'إيقاف مؤقت' : 'Pause'}
          </Button>
        )}
        {today?.canResume && (
          <Button
            size="sm"
            fullWidth
            variant="secondary"
            startIcon={<Play size={13} />}
            onClick={() => setConfirmAction('resume')}
            isLoading={isResuming}
          >
            {isAr ? 'استئناف' : 'Resume'}
          </Button>
        )}
        {today?.canCheckOut && (
          <Button
            size="sm"
            fullWidth
            variant="danger"
            startIcon={<LogOut size={13} />}
            onClick={() => setConfirmAction('check-out')}
            isLoading={isCheckingOut}
          >
            {isAr ? 'انصراف' : 'Check Out'}
          </Button>
        )}
      </div>

      {/* Status flags */}
      {today?.record?.statusFlags && today.record.statusFlags.length > 0 && !isCompact && (
        <div className="flex flex-wrap gap-1.5">
          {today.record.statusFlags.map(flag => (
            <span
              key={flag.value}
              className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {flag.label}
            </span>
          ))}
        </div>
      )}

      <Modal
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        size="sm"
        title={confirmAction ? (isAr ? confirmTitles[confirmAction].ar : confirmTitles[confirmAction].en) : ''}
        description={confirmAction ? (isAr ? confirmDesc[confirmAction].ar : confirmDesc[confirmAction].en) : ''}
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            <Button isLoading={isPending} onClick={executeAction}>
              {isAr ? 'تأكيد' : 'Confirm'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      />
    </div>
  );
}
