import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, LogIn, LogOut, Pause, Play, AlertTriangle, Info, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { extractApiError } from '@/shared/utils/error.utils';
import { useOrgSettingsData } from '@/modules/admin/org-settings/hooks/useOrgSettings';
import {
  calcExpectedEnd,
  classifyCheckIn,
  classifyNow,
  isNearDailyLimit,
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
  showExceptionLink = false,
  ...timerOptions
}: WorkTimerCardProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { data: orgSettings } = useOrgSettingsData();
  const windowConfig = useMemo(() => ({
    normalStartWindowFrom: orgSettings?.normalStartWindowFrom ?? orgSettings?.workStartTime,
    normalStartWindowTo:   orgSettings?.normalStartWindowTo   ?? orgSettings?.workEndTime,
    dailyWorkHours:        orgSettings?.dailyWorkHours,
    lateAllowanceMinutes:  orgSettings?.lateAllowanceMinutes,
  }), [orgSettings]);

  const { dailyHours } = resolveWindowConfig(windowConfig);

  const timer = useWorkTimer(timerOptions);
  const {
    today, displayHours, breakElapsed, isLoading, isActiveDay,
    isCheckingIn, isCheckingOut, isPausing, isResuming,
    checkIn, checkOut, pause, resume,
  } = timer;

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [exceptionModal, setExceptionModal] = useState<{ open: boolean; type: ExceptionRequestType }>({
    open: false,
    type: 'early_start',
  });

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

  const expectedHours = dailyHours;
  const expectedEnd = calcExpectedEnd(checkInTime, expectedHours, windowConfig);

  const checkInTiming = checkInTime
    ? classifyCheckIn(checkInTime, windowConfig)
    : (today?.canCheckIn ? classifyNow(windowConfig) : 'unknown');

  const showEarlyWarning = checkInTiming === 'early' && (today?.canCheckIn || isActiveDay);
  const showLateWarning  = checkInTiming === 'late'  && (today?.canCheckIn || isActiveDay);
  const showOvertimeHint = isActiveDay && isNearDailyLimit(displayHours ?? today?.workingHours, expectedHours);

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
      <div className="flex items-center gap-2">
        <Clock size={isCompact ? 14 : 18} className="text-[#709028] dark:text-[#A0CD39] shrink-0" />
        <span className={`font-semibold text-gray-700 dark:text-gray-300 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {isAr ? 'مؤقت الحضور' : 'Work Timer'}
        </span>
      </div>

      {/* Contextual warnings */}
      {showEarlyWarning && (
        <Banner
          variant="warning"
          icon={<AlertTriangle size={14} />}
          message={isAr
            ? 'تسجيلك قبل 10:00 ص لن يُحسب ضمن ساعات العمل إلا بعد موافقة المدير على طلب بدء مبكر.'
            : 'Check-in before 10:00 AM will not count toward work hours unless an early start request is approved.'}
          cta={isAr ? 'طلب بدء مبكر' : 'Request Early Start'}
          onCta={() => openException('early_start')}
          compact={isCompact}
        />
      )}
      {showLateWarning && (
        <Banner
          variant="warning"
          icon={<AlertTriangle size={14} />}
          message={isAr
            ? 'تسجيلك بعد 12:00 ظ يُعتبر تأخيراً. يمكنك تقديم طلب بدء متأخر.'
            : 'Check-in after 12:00 PM is considered late. You may submit a late start request.'}
          cta={isAr ? 'طلب بدء متأخر' : 'Request Late Start'}
          onCta={() => openException('late_start')}
          compact={isCompact}
        />
      )}
      {showOvertimeHint && today?.canCheckOut && (
        <Banner
          variant="info"
          icon={<Info size={14} />}
          message={isAr
            ? 'العمل الإضافي يحتاج موافقة مسبقة من المدير.'
            : 'Overtime requires prior manager approval.'}
          cta={isAr ? 'طلب أوفر تايم' : 'Request Overtime'}
          onCta={() => openException('overtime')}
          compact={isCompact}
        />
      )}

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

      {(isActiveDay || today?.record?.checkOutTime) && (
        <div className={`flex flex-col gap-1 text-gray-500 dark:text-gray-400 ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
          <div className="flex items-center justify-between gap-3">
            <span>
              {isAr ? 'حضور:' : 'In:'}{' '}
              <span className="font-mono">{formatClockTime(checkInTime, isAr)}</span>
            </span>
            <span>
              {isAr ? 'استراحة:' : 'Break:'}{' '}
              <span className="font-medium">{formatBreakMinutes(breakMinutes, isAr)}</span>
            </span>
          </div>
          {expectedEnd && isActiveDay && (
            <p className="text-center text-[#709028] dark:text-[#A0CD39]">
              {isAr ? `الانصراف المتوقع: ${expectedEnd}` : `Expected end: ${expectedEnd}`}
              {' · '}
              {isAr ? `${expectedHours} س` : `${expectedHours}h`}
            </p>
          )}
        </div>
      )}

      <div className={`flex gap-2 ${isCompact ? 'flex-col' : 'flex-wrap'}`}>
        {today?.canCheckIn && (
          <Button size="sm" fullWidth startIcon={<LogIn size={13} />}
            onClick={() => setConfirmAction('check-in')} isLoading={isCheckingIn}>
            {isAr ? 'تسجيل حضور' : 'Check In'}
          </Button>
        )}
        {today?.canPause && (
          <Button size="sm" fullWidth variant="secondary" startIcon={<Pause size={13} />}
            onClick={() => setConfirmAction('pause')} isLoading={isPausing}>
            {isAr ? 'إيقاف مؤقت' : 'Pause'}
          </Button>
        )}
        {today?.canResume && (
          <Button size="sm" fullWidth variant="secondary" startIcon={<Play size={13} />}
            onClick={() => setConfirmAction('resume')} isLoading={isResuming}>
            {isAr ? 'استئناف' : 'Resume'}
          </Button>
        )}
        {today?.canCheckOut && (
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

      {showExceptionLink && !isCompact && (
        <Link to={ROUTES.EMPLOYEE.ATTENDANCE_EXCEPTIONS}
          className="inline-flex items-center gap-1.5 text-xs text-[#709028] hover:underline">
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
  cta: string;
  onCta: () => void;
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
      <button type="button" onClick={onCta}
        className="text-xs font-semibold underline underline-offset-2 hover:opacity-80">
        {cta}
      </button>
    </div>
  );
}
