import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { attendanceTimerApi } from '../api/attendanceTimer.api';
import type { AttendanceScope, AttendanceTimer, AttendanceTodayData } from '../types/attendanceTimer.types';
import {
  isActiveWorkDay,
  mergeDashboardCheckIn,
  normalizeTodayPayload,
  resolveAttendanceScope,
} from '../utils/attendanceTimer.utils';

const POLL_MS = 45_000;

function queryKey(scope: AttendanceScope) {
  return ['attendance', 'today', scope] as const;
}

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
    const hours = data.workingHours ?? 0;
    baseHoursRef.current = hours;
    syncedAtRef.current = Date.now();
    setDisplayHours(hours);
  }, []);

  const { data: today, isLoading, refetch } = useQuery({
    queryKey: queryKey(scope),
    queryFn: async () => {
      const res = await attendanceTimerApi.today(scope);
      return res.data.data;
    },
    staleTime: 30_000,
    retry: 1,
    enabled,
    placeholderData: () => mergeDashboardCheckIn(null, options.initialData) ?? undefined,
  });

  useEffect(() => {
    if (today) applyToday(today);
  }, [today, applyToday]);

  const shouldPoll = enabled && (today?.isWorking === true);
  useEffect(() => {
    if (!shouldPoll) return;
    const id = setInterval(() => { refetch(); }, POLL_MS);
    return () => clearInterval(id);
  }, [shouldPoll, refetch]);

  // Smooth local tick while working (not paused)
  useEffect(() => {
    if (!today?.isWorking || today.isPaused) return;

    const tick = () => {
      const base = baseHoursRef.current ?? today.workingHours ?? 0;
      const synced = syncedAtRef.current ?? Date.now();
      const extra = (Date.now() - synced) / 3_600_000;
      setDisplayHours(base + extra);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [today?.isWorking, today?.isPaused, today?.workingHours]);

  // Break elapsed counter
  useEffect(() => {
    if (!today?.isPaused || !today.activeBreakStartedAt) {
      setBreakElapsed(0);
      return;
    }
    const started = today.activeBreakStartedAt;
    const tick = () => {
      const normalized = started.includes('T') ? started : started.replace(' ', 'T');
      setBreakElapsed(Math.max(0, Math.floor((Date.now() - new Date(normalized).getTime()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [today?.isPaused, today?.activeBreakStartedAt]);

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKey(scope) });

  const actionMutation = useMutation({
    mutationFn: (url: string) => attendanceTimerApi.action(url),
    onSuccess: (res) => {
      const normalized = normalizeTodayPayload(res.data.data) ?? res.data.data;
      qc.setQueryData(queryKey(scope), normalized);
      applyToday(normalized);
      invalidate();
    },
  });

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

  return {
    scope,
    today: today ?? null,
    displayHours,
    breakElapsed,
    isLoading,
    isActiveDay: isActiveWorkDay(today ?? null),
    isCheckingIn:  pending && pendingAction === today?.checkInUrl,
    isCheckingOut: pending && pendingAction === today?.checkOutUrl,
    isPausing:     pending && pendingAction === today?.pauseUrl,
    isResuming:    pending && pendingAction === today?.resumeUrl,
    checkIn:  (onSuccess, onError) => runAction(today?.checkInUrl, onSuccess, onError),
    checkOut: (onSuccess, onError) => runAction(today?.checkOutUrl, onSuccess, onError),
    pause:    (onSuccess, onError) => runAction(today?.pauseUrl, onSuccess, onError),
    resume:   (onSuccess, onError) => runAction(today?.resumeUrl, onSuccess, onError),
    refetch:  () => { invalidate(); },
  };
}
