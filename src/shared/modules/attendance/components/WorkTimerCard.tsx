import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, LogIn, LogOut, AlertTriangle, FileText, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES } from '@/app/router/routes';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { extractApiError } from '@/shared/utils/error.utils';
import { utcClockToLocal } from '@/shared/utils/date.utils';
import { useOrgSettingsData } from '@/modules/admin/org-settings/hooks/useOrgSettings';
import {
  calcExpectedEnd,
  classifyCheckIn,
  classifyNow,
  resolveWindowConfig,
} from '@/shared/utils/attendanceWindow.utils';
import { AttendanceExceptionRequestModal } from './AttendanceExceptionRequestModal';
import { useWorkTimer, type UseWorkTimerOptions } from '../hooks/useWorkTimer';
import {
  formatBreakMinutes,
  formatClockTime,
  formatWorkingHours,
  workStatusStyle,
} from '../utils/attendanceTimer.utils';
import type { ExceptionRequestType } from '../types/attendanceException.types';

type ConfirmAction = 'check-in' | 'check-out' | 'pause' | 'resume';

export interface WorkTimerCardProps extends UseWorkTimerOptions {
  variant?: 'compact' | 'card';
  className?: string;
  /** Show link to employee exception requests list */
  showExceptionLink?: boolean;
  /** Override default exception list path */
  exceptionHref?: string;
  /** Called when the exception link is clicked (e.g. close a parent dropdown) */
  onExceptionNavigate?: () => void;
}

export function WorkTimerCard({
  variant = 'card',
  className = '',
  showExceptionLink = false,
  exceptionHref = ROUTES.EMPLOYEE.ATTENDANCE_EXCEPTIONS,
  onExceptionNavigate,
  ...timerOptions
}: WorkTimerCardProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { isSuperAdmin, can } = useAuth();
  const canViewExceptions = can('view-attendance');
  const { data: orgSettings } = useOrgSettingsData();
  const windowConfig = useMemo(() => ({
    normalStartWindowFrom: orgSettings?.normalStartWindowFrom ?? orgSettings?.workStartTime,
    // Start window end — do NOT fall back to workEndTime (that would stretch "normal" all day)
    normalStartWindowTo:   orgSettings?.normalStartWindowTo,
    dailyWorkHours:        orgSettings?.dailyWorkHours,
    lateAllowanceMinutes:  orgSettings?.lateAllowanceMinutes,
  }), [orgSettings]);

  const { dailyHours } = resolveWindowConfig(windowConfig);

  const timer = useWorkTimer({
    ...timerOptions,
    enabled: (timerOptions.enabled ?? true) && !isSuperAdmin,
  });
  const {
    today, displayHours, breakMinutes, isLoading, isActiveDay,
    offerCheckIn, offerCheckOut, offerPause, offerResume,
    isCheckingIn, isCheckingOut, isPausing, isResuming,
    checkIn, checkOut, pause, resume,
  } = timer;

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [exceptionModal, setExceptionModal] = useState<{ open: boolean; type: ExceptionRequestType }>({
    open: false,
    type: 'early_start',
  });

  // Super admin does not check in / out
  if (isSuperAdmin) return null;

  if (isLoading && !today) {
    return (
      <div className={`animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 ${variant === 'compact' ? 'h-32 mx-3 mb-3' : 'h-48'} ${className}`} />
    );
  }

  const isPaused = Boolean(today?.isPaused || today?.workStatus === 'on_break');
  const status = isPaused ? 'on_break' : (today?.workStatus ?? 'offline');
  const style  = workStatusStyle(status);
  const statusLabel = isPaused
    ? (isAr ? 'متوقف' : 'Paused')
    : today?.workStatusLabel && today.workStatus !== 'offline'
      ? today.workStatusLabel
      : (isAr ? 'يعمل حاليًا' : 'Currently working');

  const checkInTimeRaw = today?.record?.checkInTime ?? today?.checkInTime ?? null;
  const checkOutTimeRaw = today?.record?.checkOutTime ?? today?.checkOutTime ?? null;
  // API clocks are UTC — convert for window checks / expected end (display converts in formatClockTime)
  const checkInTime = utcClockToLocal(checkInTimeRaw);
  const timerText = formatWorkingHours(displayHours ?? today?.workingHours ?? null);
  const isCompact = variant === 'compact';

  const expectedHours = dailyHours;
  const expectedEnd = calcExpectedEnd(checkInTime, expectedHours, windowConfig, isAr);

  const checkInTiming = checkInTime
    ? classifyCheckIn(checkInTime, windowConfig)
    : (offerCheckIn ? classifyNow(windowConfig) : 'unknown');

  // Late is informational only — timer always starts on check-in at any time
  const showLateWarning = checkInTiming === 'late' && (offerCheckIn || isActiveDay);

  function openException(type: ExceptionRequestType) {
    setExceptionModal({ open: true, type });
  }

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
          () => handleSuccess('تم إيقاف العمل', 'Work paused'),
          (err) => handleError(err, 'فشل إيقاف العمل', 'Pause failed'),
        );
        break;
      case 'resume':
        resume(
          () => handleSuccess('تم استكمال العمل', 'Work resumed'),
          (err) => handleError(err, 'فشل استكمال العمل', 'Resume failed'),
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
    pause:       { ar: 'إيقاف العمل', en: 'Pause Work' },
    resume:      { ar: 'استكمال العمل', en: 'Resume Work' },
  };

  const confirmDesc: Record<ConfirmAction, { ar: string; en: string }> = {
    'check-in':  { ar: 'هل تريد بدء يوم العمل الآن؟ المؤقت سيبدأ فوراً ويمكنك إيقافه مؤقتاً أو الانصراف لاحقاً.', en: 'Start your work day now? The timer starts immediately — you can pause or check out later.' },
    'check-out': { ar: 'هل تريد تسجيل الانصراف الآن؟', en: 'Check out now?' },
    pause:       { ar: 'هل تريد إيقاف العمل مؤقتاً؟ سيتوقف المؤقت حتى الاستكمال.', en: 'Pause work now? The timer will stop until you resume.' },
    resume:      { ar: 'هل تريد استكمال العمل الآن؟', en: 'Resume work now?' },
  };

  const isPending = isCheckingIn || isCheckingOut || isPausing || isResuming;

  return (
    <div className={`${shell} ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Clock size={isCompact ? 14 : 18} className="text-[#709028] dark:text-[#A0CD39] shrink-0" />
        <span className={`font-semibold text-gray-700 dark:text-gray-300 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {isAr ? 'مؤقت الحضور' : 'Work Timer'}
        </span>
      </div>

      {/* Late is informational only — work is allowed anytime/anywhere */}
      {showLateWarning && (
        <Banner
          variant="warning"
          icon={<AlertTriangle size={14} />}
          message={isAr
            ? 'تسجيلك بعد نافذة الحضور الطبيعي يُسجَّل كتأخير، لكن المؤقت يبدأ فوراً من لحظة الحضور.'
            : 'Check-in after the normal window is marked late, but the timer starts immediately from check-in.'}
          cta={canViewExceptions ? (isAr ? 'طلب بدء متأخر' : 'Request Late Start') : undefined}
          onCta={canViewExceptions ? () => openException('late_start') : undefined}
          compact={isCompact}
        />
      )}

      <div className={`text-center ${isCompact ? 'rounded-xl bg-white/80 dark:bg-gray-800/60 px-3 py-2' : ''}`}>
        <p className={`font-mono font-bold text-gray-900 dark:text-gray-100 tracking-widest tabular-nums ${isCompact ? 'text-[17px]' : 'text-3xl'}`}>
          {timerText}
        </p>
        {isActiveDay && (
          <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {statusLabel}
          </div>
        )}
      </div>

      {(isActiveDay || checkInTimeRaw) && (
        <div className={`flex flex-col gap-1 text-gray-500 dark:text-gray-400 ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
          <div className="flex items-center justify-between gap-3">
            <span>
              {isAr ? 'حضور:' : 'In:'}{' '}
              <span className="font-mono">{formatClockTime(checkInTimeRaw, isAr)}</span>
            </span>
            {checkOutTimeRaw ? (
              <span>
                {isAr ? 'انصراف:' : 'Out:'}{' '}
                <span className="font-mono">{formatClockTime(checkOutTimeRaw, isAr)}</span>
              </span>
            ) : (
              <span>
                {isAr ? 'استراحة:' : 'Break:'}{' '}
                <span className="font-medium">{formatBreakMinutes(breakMinutes, isAr)}</span>
              </span>
            )}
          </div>
          {expectedEnd && isActiveDay && !isPaused && (
            <p className="text-center text-[#709028] dark:text-[#A0CD39]">
              {isAr ? `الانصراف المتوقع: ${expectedEnd}` : `Expected end: ${expectedEnd}`}
              {' · '}
              {isAr ? `${expectedHours} س` : `${expectedHours}h`}
            </p>
          )}
        </div>
      )}

      <div className={`flex gap-2 ${isCompact ? 'flex-col' : 'flex-wrap'}`}>
        {offerCheckIn && (
          <Button size="sm" fullWidth startIcon={<LogIn size={13} />}
            onClick={() => setConfirmAction('check-in')} isLoading={isCheckingIn}>
            {isAr ? 'تسجيل حضور' : 'Check In'}
          </Button>
        )}
        {offerPause && (
          <Button size="sm" fullWidth variant="secondary" startIcon={<Pause size={13} />}
            onClick={() => setConfirmAction('pause')} isLoading={isPausing}>
            {isAr ? 'إيقاف' : 'Pause'}
          </Button>
        )}
        {offerResume && (
          <Button size="sm" fullWidth startIcon={<Play size={13} />}
            onClick={() => setConfirmAction('resume')} isLoading={isResuming}>
            {isAr ? 'استكمال' : 'Resume'}
          </Button>
        )}
        {offerCheckOut && (
          <Button size="sm" fullWidth variant="danger" startIcon={<LogOut size={13} />}
            onClick={() => setConfirmAction('check-out')} isLoading={isCheckingOut}>
            {isAr ? 'انصراف' : 'Check Out'}
          </Button>
        )}
      </div>

      {today?.record?.statusFlags && today.record.statusFlags.length > 0 && !isCompact && (
        <div className="flex flex-wrap gap-1.5">
          {today.record.statusFlags.map(flag => (
            <span key={flag.value}
              className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {flag.label}
            </span>
          ))}
        </div>
      )}

      {showExceptionLink && canViewExceptions && !isCompact && (
        <Link
          to={exceptionHref}
          onClick={(e) => {
            if (onExceptionNavigate) {
              e.preventDefault();
              onExceptionNavigate();
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#709028] hover:underline"
        >
          <FileText size={13} />
          {isAr ? 'طلبات الاستثناء' : 'My exception requests'}
        </Link>
      )}

      <Modal
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        size="sm"
        title={confirmAction ? (isAr ? confirmTitles[confirmAction].ar : confirmTitles[confirmAction].en) : ''}
        description={confirmAction ? (isAr ? confirmDesc[confirmAction].ar : confirmDesc[confirmAction].en) : ''}
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            <Button isLoading={isPending} onClick={executeAction}>{isAr ? 'تأكيد' : 'Confirm'}</Button>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
          </div>
        }
      />

      <AttendanceExceptionRequestModal
        open={exceptionModal.open}
        onClose={() => setExceptionModal((s) => ({ ...s, open: false }))}
        isAr={isAr}
        defaultType={exceptionModal.type}
      />
    </div>
  );
}

function Banner({
  variant, icon, message, cta, onCta, compact,
}: {
  variant: 'warning' | 'info';
  icon: React.ReactNode;
  message: string;
  cta?: string;
  onCta?: () => void;
  compact: boolean;
}) {
  const colors = variant === 'warning'
    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${colors} ${compact ? 'text-[10px]' : 'text-xs'}`}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <p className="leading-relaxed">{message}</p>
      </div>
      {cta && onCta && (
        <button type="button" onClick={onCta}
          className="text-xs font-semibold underline underline-offset-2 hover:opacity-80">
          {cta}
        </button>
      )}
    </div>
  );
}
