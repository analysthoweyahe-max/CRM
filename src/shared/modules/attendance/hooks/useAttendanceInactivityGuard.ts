import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import {
  ensureDesktopNotificationPermission,
  showDesktopNotification,
} from '@/shared/utils/desktopNotification.utils';
import {
  isAttendanceRunning,
  pauseAttendanceIfRunning,
} from '../services/attendanceTimerBridge';
import { resolveAttendanceScope } from '../utils/attendanceTimer.utils';
import { useWorkTimer } from './useWorkTimer';

/** How long the user may stay idle / away before we auto-pause. */
const STALE_MS = 30 * 60 * 1000;
/** Debounce window for coalescing rapid activity into one “last active” stamp. */
const ACTIVITY_DEBOUNCE_MS = 1_000;
/** Wall-clock safety net — catches throttled background timers. */
const WATCHDOG_MS = 30_000;

const ACTIVITY_EVENTS = [
  'pointerdown',
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
] as const;

/**
 * While the work timer is running (non–super-admin only):
 * - Debounce user activity into a last-active timestamp.
 * - After ~30 minutes idle, or ~30 minutes with the tab hidden, auto-pause
 *   and notify via OS desktop notification (+ in-app toast fallback).
 * The timer does NOT pause merely on blur — only after the 30-minute threshold.
 */
export function useAttendanceInactivityGuard(): void {
  const { user, isSuperAdmin } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const qc = useQueryClient();
  const scope = resolveAttendanceScope(user?.role, user?.section);

  // Keep today cached so isAttendanceRunning / pauseAttendanceIfRunning see fresh state.
  const { isActiveDay, offerPause } = useWorkTimer({
    enabled: Boolean(user) && !isSuperAdmin,
  });

  const guardActive = Boolean(user) && !isSuperAdmin && isActiveDay && offerPause;

  const lastActiveAtRef = useRef(Date.now());
  const hiddenAtRef = useRef<number | null>(null);
  const pausingRef = useRef(false);
  const activityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!guardActive) {
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
      if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
      activityDebounceRef.current = null;
      staleTimerRef.current = null;
      hiddenTimerRef.current = null;
      hiddenAtRef.current = null;
      pausingRef.current = false;
      return;
    }

    void ensureDesktopNotificationPermission();

    const clearStaleTimer = () => {
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
        staleTimerRef.current = null;
      }
    };

    const clearHiddenTimer = () => {
      if (hiddenTimerRef.current) {
        clearTimeout(hiddenTimerRef.current);
        hiddenTimerRef.current = null;
      }
    };

    const notifyPaused = () => {
      const title = isAr ? 'تم إيقاف المؤقت مؤقتاً' : 'Timer paused';
      const body = isAr
        ? 'لم نرصد نشاطاً لمدة 30 دقيقة. افتح النظام واستكمل المؤقت.'
        : 'No activity for 30 minutes. Open the app and resume your timer.';

      showDesktopNotification({
        title,
        body,
        tag: 'attendance-inactivity-pause',
      });

      toast.warning(title, { description: body, duration: 10_000 });
    };

    const pauseForInactivity = async () => {
      if (pausingRef.current) return;
      if (!isAttendanceRunning(qc, scope)) return;

      pausingRef.current = true;
      clearStaleTimer();
      clearHiddenTimer();

      try {
        const paused = await pauseAttendanceIfRunning(qc, scope);
        if (paused) notifyPaused();
      } catch {
        toast.error(isAr ? 'تعذر إيقاف المؤقت تلقائياً' : 'Could not auto-pause the timer');
      } finally {
        pausingRef.current = false;
      }
    };

    const scheduleStaleTimer = () => {
      clearStaleTimer();
      const elapsed = Date.now() - lastActiveAtRef.current;
      const remaining = Math.max(0, STALE_MS - elapsed);
      staleTimerRef.current = setTimeout(() => {
        void pauseForInactivity();
      }, remaining);
    };

    const stampActivity = () => {
      lastActiveAtRef.current = Date.now();
      scheduleStaleTimer();
    };

    /** Debounced last-active: rapid input coalesces into one stamp. */
    const onActivity = () => {
      if (document.visibilityState !== 'visible') return;
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
      activityDebounceRef.current = setTimeout(() => {
        activityDebounceRef.current = null;
        stampActivity();
      }, ACTIVITY_DEBOUNCE_MS);
    };

    const scheduleHiddenTimer = () => {
      clearHiddenTimer();
      const leftAt = hiddenAtRef.current ?? Date.now();
      hiddenAtRef.current = leftAt;
      const remaining = Math.max(0, STALE_MS - (Date.now() - leftAt));
      hiddenTimerRef.current = setTimeout(() => {
        void pauseForInactivity();
      }, remaining);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Drop any pending activity stamp — leaving the tab is not activity.
        if (activityDebounceRef.current) {
          clearTimeout(activityDebounceRef.current);
          activityDebounceRef.current = null;
        }
        hiddenAtRef.current = Date.now();
        scheduleHiddenTimer();
        return;
      }

      // Tab is visible again — catch up if the leave-timeout was throttled.
      const leftAt = hiddenAtRef.current;
      clearHiddenTimer();
      hiddenAtRef.current = null;

      if (leftAt != null && Date.now() - leftAt >= STALE_MS) {
        void pauseForInactivity();
        return;
      }

      stampActivity();
    };

    const watchdog = () => {
      if (!isAttendanceRunning(qc, scope)) return;

      const idleFor = Date.now() - lastActiveAtRef.current;
      const awayFor = hiddenAtRef.current != null
        ? Date.now() - hiddenAtRef.current
        : 0;

      if (idleFor >= STALE_MS || awayFor >= STALE_MS) {
        void pauseForInactivity();
      }
    };

    lastActiveAtRef.current = Date.now();
    scheduleStaleTimer();

    if (document.visibilityState === 'hidden') {
      hiddenAtRef.current = Date.now();
      scheduleHiddenTimer();
    }

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, onActivity, { passive: true, capture: true });
    }
    document.addEventListener('visibilitychange', onVisibility);
    const watchdogId = setInterval(watchdog, WATCHDOG_MS);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, onActivity, { capture: true });
      }
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(watchdogId);
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
      clearStaleTimer();
      clearHiddenTimer();
    };
  }, [guardActive, qc, scope, isAr]);
}
