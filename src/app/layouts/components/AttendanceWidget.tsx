import { useState } from 'react';
import { Clock, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { Button }  from '@/shared/components/ui/Button';
import { Modal }   from '@/shared/components/ui/Modal';
import { extractApiError } from '@/shared/utils/error.utils';
import type { AttendanceWidgetProps } from './useAttendanceWidget';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** checkInTime is a bare "HH:MM:SS" string (not a full date), so format it
 * directly instead of going through `new Date()` — that would be an invalid
 * date and either render "Invalid Date" or throw depending on the browser. */
function formatTime(time: string | null, isAr: boolean): string {
  if (!time) return '--:--';
  const [hStr, mStr] = time.split(':');
  const h24 = parseInt(hStr, 10);
  if (Number.isNaN(h24)) return '--:--';
  const period = h24 >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
  const h12    = h24 % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${mStr} ${period}`;
}

export function AttendanceWidget(props: AttendanceWidgetProps) {
  const { isCheckedIn, checkInTime, elapsed, checkIn, checkOut, isCheckingIn, isCheckingOut } = props;
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [confirmAction, setConfirmAction] = useState<'check-in' | 'check-out' | null>(null);

  function handleCheckIn() {
    setConfirmAction(null);
    checkIn(
      () => toast.success(isAr ? 'تم تسجيل الحضور' : 'Checked in successfully'),
      (err) => toast.error(extractApiError(err) || (isAr ? 'فشل تسجيل الحضور' : 'Check-in failed')),
    );
  }

  function handleCheckOut() {
    setConfirmAction(null);
    checkOut(
      () => toast.success(isAr ? 'تم تسجيل الانصراف، طاب يومك 👋' : 'Checked out, have a great day!'),
      (err) => toast.error(extractApiError(err) || (isAr ? 'فشل تسجيل الانصراف' : 'Check-out failed')),
    );
  }

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-[#A0CD39]/40 bg-[#D8EBAE]/30 dark:bg-[#A0CD39]/5 dark:border-[#A0CD39]/20 p-3 space-y-2.5">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-[#709028] dark:text-[#A0CD39] shrink-0" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
          {isAr ? 'تسجيل الحضور' : 'Attendance'}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
          {isAr ? 'الحالة' : 'Status'}
        </span>
        <span className={`text-[11px] font-semibold ${isCheckedIn ? 'text-[#709028] dark:text-[#A0CD39]' : 'text-gray-400'}`}>
          {isCheckedIn
            ? (isAr ? 'يعمل الآن' : 'Working')
            : (isAr ? 'لم يتم التسجيل' : 'Not checked in')}
        </span>
      </div>

      {/* Timer box */}
      {isCheckedIn && (
        <div className="rounded-xl bg-white/80 dark:bg-gray-800/60 px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
            {isAr ? 'ساعات العمل اليوم' : 'Work hours today'}
          </p>
          <p className="text-[17px] font-mono font-bold text-gray-800 dark:text-gray-100 tracking-widest tabular-nums">
            {formatElapsed(elapsed)}
          </p>
        </div>
      )}

      {/* Start time */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
          {isAr ? 'وقت بداية اليوم' : 'Start time'}
        </span>
        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
          {formatTime(checkInTime, isAr)}
        </span>
      </div>

      {/* Action button */}
      {isCheckedIn ? (
        <Button
          size="sm"
          fullWidth
          variant="danger"
          startIcon={<LogOut size={13} />}
          onClick={() => setConfirmAction('check-out')}
          isLoading={isCheckingOut}
        >
          {isAr ? 'تسجيل الانصراف' : 'Check Out'}
        </Button>
      ) : (
        <Button
          size="sm"
          fullWidth
          onClick={() => setConfirmAction('check-in')}
          isLoading={isCheckingIn}
        >
          {isAr ? 'تسجيل الحضور' : 'Check In'}
        </Button>
      )}

      {/* Confirmation modal — guards against an accidental click */}
      <Modal
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        size="sm"
        title={
          confirmAction === 'check-in'
            ? (isAr ? 'تسجيل الحضور' : 'Check In')
            : (isAr ? 'تسجيل الانصراف' : 'Check Out')
        }
        description={
          confirmAction === 'check-in'
            ? (isAr ? 'هل تريد بدء تسجيل الحضور الآن؟' : 'Do you want to start your check-in now?')
            : (isAr ? 'هل تريد تسجيل الانصراف الآن؟' : 'Do you want to check out now?')
        }
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            {confirmAction === 'check-in' ? (
              <Button isLoading={isCheckingIn} onClick={handleCheckIn}>
                {isAr ? 'بدأ' : 'Start'}
              </Button>
            ) : (
              <Button variant="danger" isLoading={isCheckingOut} onClick={handleCheckOut}>
                {isAr ? 'تسجيل الانصراف' : 'Check Out'}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      />
    </div>
  );
}
