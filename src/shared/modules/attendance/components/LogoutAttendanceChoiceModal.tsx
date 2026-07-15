import { useEffect, useState } from 'react';
import { Coffee, LogOut } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { useWorkTimer } from '../hooks/useWorkTimer';
import type { AttendanceScope } from '../types/attendanceTimer.types';

type PendingAction = 'check-out' | 'pause' | null;

interface Props {
  open:         boolean;
  onClose:      () => void;
  onComplete:   () => void | Promise<void>;
  layoutScope?: AttendanceScope;
  isAr:         boolean;
}

function isAlreadyCheckedOut(today: {
  checkOutTime?: string | null;
  record?: { checkOutTime?: string | null } | null;
} | null): boolean {
  return Boolean(today?.record?.checkOutTime ?? today?.checkOutTime);
}

/**
 * Shown on logout for attendance portals.
 * Open session → choose check-out or temporary pause.
 * Already checked out / idle → confirm logout only.
 */
export function LogoutAttendanceChoiceModal({
  open,
  onClose,
  onComplete,
  layoutScope,
  isAr,
}: Props) {
  const {
    today,
    isLoading,
    isActiveDay,
    offerCheckOut,
    offerPause,
    checkOut,
    pause,
  } = useWorkTimer({ layoutScope, enabled: open });

  const [pending, setPending] = useState<PendingAction>(null);
  const checkedOut = isAlreadyCheckedOut(today);
  // After check-out (or with no open session), skip attendance actions.
  const needsAttendanceChoice = isActiveDay && !checkedOut;

  useEffect(() => {
    if (!open) setPending(null);
  }, [open]);

  async function finishLogout() {
    await onComplete();
  }

  function runThenLogout(action: 'check-out' | 'pause') {
    setPending(action);
    const run = action === 'check-out' ? checkOut : pause;
    run(
      () => { void finishLogout(); },
      () => {
        // Still allow logout if pause/check-out fails.
        void finishLogout();
      },
    );
  }

  // Already checked out, or never started today — confirm plain logout.
  if (open && !isLoading && !needsAttendanceChoice) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        size="sm"
        title={isAr ? 'تسجيل الخروج' : 'Logout'}
        description={
          checkedOut
            ? (isAr
              ? 'تم تسجيل انصرافك بالفعل. هل تريد تسجيل الخروج من الحساب؟'
              : 'You are already checked out. Do you want to log out of your account?')
            : (isAr
              ? 'هل تريد تسجيل الخروج من الحساب؟'
              : 'Do you want to log out of your account?')
        }
        footer={
          <div className="flex items-center gap-3 justify-start flex-row-reverse">
            <Button
              variant="danger"
              isLoading={pending !== null}
              onClick={() => { setPending('check-out'); void finishLogout(); }}
            >
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={pending !== null}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onClose}
      size="sm"
      title={isAr ? 'قبل تسجيل الخروج' : 'Before you log out'}
      description={
        isAr
          ? 'لديك جلسة حضور مفتوحة. اختر إنهاء اليوم (انصراف) أو إيقاف مؤقت ثم الخروج.'
          : 'You have an open attendance session. Check out to end the day, or pause temporarily, then log out.'
      }
    >
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/50" />
      ) : (
        <div className="flex flex-col gap-3">
          {offerCheckOut && (
            <Button
              variant="danger"
              fullWidth
              startIcon={<LogOut size={16} />}
              isLoading={pending === 'check-out'}
              disabled={pending !== null}
              onClick={() => runThenLogout('check-out')}
            >
              {isAr ? 'انصراف ثم الخروج' : 'Check out & log out'}
            </Button>
          )}
          {(offerPause || needsAttendanceChoice) && (
            <Button
              variant="secondary"
              fullWidth
              startIcon={<Coffee size={16} />}
              isLoading={pending === 'pause'}
              disabled={pending !== null}
              onClick={() => {
                if (offerPause) {
                  runThenLogout('pause');
                } else {
                  // Already paused — keep the pause and leave.
                  setPending('pause');
                  void finishLogout();
                }
              }}
            >
              {offerPause
                ? (isAr ? 'إيقاف مؤقت ثم الخروج' : 'Pause temporarily & log out')
                : (isAr ? 'الإبقاء على الإيقاف والخروج' : 'Keep paused & log out')}
            </Button>
          )}
          <Button variant="ghost" fullWidth onClick={onClose} disabled={pending !== null}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
