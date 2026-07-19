import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { attendanceTimerApi } from '../api/attendanceTimer.api';
import {
  applyAttendanceActionResult,
  attendanceTodayQueryKey,
} from '../services/attendanceTimerBridge';
import type { AttendanceScope, AttendanceTimer, AttendanceTodayData } from '../types/attendanceTimer.types';
import {
  attendanceCheckInPath,
  attendanceCheckOutPath,
  attendancePausePath,
  attendanceResumePath,
  breakElapsedSeconds,
  canOfferCheckIn,
  canOfferCheckOut,
  canOfferPause,
  canOfferResume,
  deriveWorkingHours,
  isActiveWorkDay,
  mergeDashboardCheckIn,
  withAnytimeAttendanceActions,
  resolveAttendanceScope,
} from '../utils/attendanceTimer.utils';

const POLL_MS = 45_000;

export interface UseWorkTimerOptions {
  layoutScope?:  AttendanceScope;
  initialData?: Partial<AttendanceTimer> | null;
  enabled?:      boolean;
}

export interface UseWorkTimerResult {
  scope:            AttendanceScope;
  today:            AttendanceTodayData | null;
  displayHours:     number | null;
  breakElapsed:     number;
  isLoading:        boolean;
  isActiveDay:      boolean;
  offerCheckIn:     boolean;
  offerCheckOut:    boolean;
  offerPause:       boolean;
  offerResume:      boolean;
  isCheckingIn:     boolean;
  isCheckingOut:    boolean;
  isPausing:        boolean;
  isResuming:       boolean;
  checkIn:          (onSuccess?: () => void, onError?: (err: unknown) => void) => void;
  checkOut:         (onSuccess?: () => void, onError?: (err: unknown) => void) => void;
  pause:            (onSuccess?: () => void, onError?: (err: unknown) => void) => void;
  resume:           (onSuccess?: () => void, onError?: (err: unknown) => void) => void;
  refetch:          () => void;
}

export function useWorkTimer(options: UseWorkTimerOptions = {}): UseWorkTimerResult {
  const { user } = useAuth();
  const scope = resolveAttendanceScope(user?.role, user?.section, options.layoutScope);
  const enabled = options.enabled ?? !!user;
  const qc = useQueryClient();

  const [displayHours, setDisplayHours] = useState<number | null>(null);
  const [breakElapsed, setBreakElapsed] = useState(0);
  const syncedAtRef = useRef<number | null>(null);
  const baseHoursRef = useRef<number | null>(null);

  const applyToday = useCallback((data: AttendanceTodayData | null) => {
    if (!data) return;
    const hours = deriveWorkingHours(data) ?? data.workingHours ?? 0;
    baseHoursRef.current = hours;
    syncedAtRef.current = Date.now();
    setDisplayHours(hours);
  }, []);

  const { data: today, isLoading, refetch } = useQuery({
    queryKey: attendanceTodayQueryKey(scope),
    queryFn: async () => {
      const res = await attendanceTimerApi.today(scope);
      const raw = res.data.data;
      return raw ? withAnytimeAttendanceActions(raw) : raw;
    },
    staleTime: 30_000,
    retry: 1,
    enabled,
    // One shared poll for all subscribers of this query key (header + sidebar + cards).
    refetchInterval: (query) => {
      const data = query.state.data as AttendanceTodayData | null | undefined;
      return enabled && isActiveWorkDay(data ?? null) ? POLL_MS : false;
    },
    placeholderData: () => {
      const merged = mergeDashboardCheckIn(null, options.initialData);
      return merged ? withAnytimeAttendanceActions(merged) : undefined;
    },
  });

  useEffect(() => {
    if (today) applyToday(today);
  }, [today, applyToday]);

  const actionMutation = useMutation({
    mutationFn: (url: string) => attendanceTimerApi.action(url),
    onSuccess: (res) => {
      const patched = applyAttendanceActionResult(qc, scope, res.data.data);
      applyToday(patched);
    },
  });

  const isPaused = Boolean(today?.isPaused || today?.workStatus === 'on_break');

  // Smooth local tick while working; freeze while paused.
  // Wall-clock based — browsers throttle setInterval in background tabs, so we
  // also re-tick on visibilitychange so the display catches up immediately
  // instead of appearing frozen after leaving the tab.
  useEffect(() => {
    if (!isActiveWorkDay(today ?? null)) return;
    if (isPaused) {
      setDisplayHours(baseHoursRef.current ?? deriveWorkingHours(today ?? null) ?? today?.workingHours ?? 0);
      return;
    }

    const tick = () => {
      const base = baseHoursRef.current ?? deriveWorkingHours(today ?? null) ?? today?.workingHours ?? 0;
      const synced = syncedAtRef.current ?? Date.now();
      const extra = (Date.now() - synced) / 3_600_000;
      setDisplayHours(base + extra);
    };

    tick();
    const id = setInterval(tick, 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [today, today?.workingHours, today?.isWorking, isPaused, today?.workStatus]);

  // Live break elapsed while paused
  useEffect(() => {
    if (!isPaused) {
      setBreakElapsed(0);
      return;
    }
    const tick = () => setBreakElapsed(breakElapsedSeconds(today?.activeBreakStartedAt ?? null));
    tick();
    const id = setInterval(tick, 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [isPaused, today?.activeBreakStartedAt]);

  function runAction(
    url: string | undefined,
    onSuccess?: () => void,
    onError?: (err: unknown) => void,
  ) {
    if (!url) {
      onError?.(new Error('Action URL missing'));
      return;
    }
    actionMutation.mutate(url, { onSuccess: () => onSuccess?.(), onError });
  }

  const pending = actionMutation.isPending;
  const pendingAction = actionMutation.variables;

  const checkInUrl  = today?.checkInUrl  ?? attendanceCheckInPath(scope);
  const checkOutUrl = today?.checkOutUrl ?? attendanceCheckOutPath(scope);
  const pauseUrl    = today?.pauseUrl    ?? attendancePausePath(scope);
  const resumeUrl   = today?.resumeUrl   ?? attendanceResumePath(scope);

  const todayData = today ?? null;

  return {
    scope,
    today: todayData,
    displayHours,
    breakElapsed,
    isLoading,
    isActiveDay: isActiveWorkDay(todayData),
    offerCheckIn:  canOfferCheckIn(todayData),
    offerCheckOut: canOfferCheckOut(todayData),
    offerPause:    canOfferPause(todayData),
    offerResume:   canOfferResume(todayData),
    isCheckingIn:  pending && pendingAction === checkInUrl,
    isCheckingOut: pending && pendingAction === checkOutUrl,
    isPausing:     pending && pendingAction === pauseUrl,
    isResuming:    pending && pendingAction === resumeUrl,
    checkIn:  (onSuccess, onError) => runAction(checkInUrl, onSuccess, onError),
    checkOut: (onSuccess, onError) => runAction(checkOutUrl, onSuccess, onError),
    pause:    (onSuccess, onError) => runAction(pauseUrl, onSuccess, onError),
    resume:   (onSuccess, onError) => runAction(resumeUrl, onSuccess, onError),
    refetch:  () => { void refetch(); },
  };
}
