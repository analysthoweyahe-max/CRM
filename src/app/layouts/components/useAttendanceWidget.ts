import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/modules/hr/attendance/api/attendance.api';
import { useAuth } from '@/modules/auth/context/AuthContext';

const QUERY_KEY = ['employee', 'attendance', 'today'];

/** Combine "YYYY-MM-DD" + "HH:MM:SS" → elapsed seconds from now */
function elapsedSeconds(date: string, time: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(`${date} ${time}`).getTime()) / 1000));
}

export interface AttendanceWidgetProps {
  isCheckedIn:   boolean;
  isLoading:     boolean;
  checkInTime:   string | null;   // "HH:MM:SS" for display
  elapsed:       number;
  isCheckingIn:  boolean;
  isCheckingOut: boolean;
  checkIn:  (onSuccess?: () => void, onError?: (err: unknown) => void) => void;
  checkOut: (onSuccess?: () => void, onError?: (err: unknown) => void) => void;
}

export function useAttendanceWidget(): AttendanceWidgetProps {
  const { user } = useAuth();
  const hasAttendanceRecord = user?.role === 'employee' || user?.role === 'seo-member' || user?.role === 'admin';
  const queryClient = useQueryClient();

  /**
   * localCheckIn stores "YYYY-MM-DD|HH:MM:SS" so we can split for elapsed calc.
   * Using a pipe separator avoids creating a Date object on every render.
   */
  const [localCheckIn, setLocalCheckIn] = useState<string | null>(null);
  const [elapsed, setElapsed]           = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch today's status (restores state on page refresh) ──
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn:  () => attendanceApi.employeeToday(),
    staleTime: 60_000,
    retry: 1,
    enabled: hasAttendanceRecord,
  });

  useEffect(() => {
    const record = data?.data?.data;
    if (!record) return;
    const { date, checkInTime, checkOutTime } = record;
    if (date && checkInTime && !checkOutTime) {
      // still working → restore timer
      setLocalCheckIn(`${date}|${checkInTime}`);
    } else {
      setLocalCheckIn(null);
    }
  }, [data]);

  // ── Tick every second ──
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (localCheckIn) {
      const [date, time] = localCheckIn.split('|');
      const tick = () => setElapsed(elapsedSeconds(date, time));
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [localCheckIn]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const checkInMutation  = useMutation({ mutationFn: () => attendanceApi.employeeCheckIn() });
  const checkOutMutation = useMutation({ mutationFn: () => attendanceApi.employeeCheckOut() });

  // display time: just the "HH:MM:SS" part
  const checkInTime = localCheckIn ? localCheckIn.split('|')[1] ?? null : null;

  return {
    isCheckedIn:   !!localCheckIn,
    isLoading,
    checkInTime,
    elapsed,
    isCheckingIn:  checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,

    checkIn(onSuccess, onError) {
      // ← UI switches + counter starts IMMEDIATELY (no API wait)
      const now   = new Date();
      const date  = now.toISOString().slice(0, 10);
      const time  = now.toTimeString().slice(0, 8);  // "HH:MM:SS"
      setLocalCheckIn(`${date}|${time}`);

      checkInMutation.mutate(undefined, {
        onSuccess: (res) => {
          const r = res?.data?.data;
          if (r?.date && r?.checkInTime) {
            setLocalCheckIn(`${r.date}|${r.checkInTime}`); // sync with server time
          }
          invalidate();
          onSuccess?.();
        },
        onError: (err) => {
          setLocalCheckIn(null); // revert
          onError?.(err);
        },
      });
    },

    checkOut(onSuccess, onError) {
      // ← UI switches IMMEDIATELY
      const prev = localCheckIn;
      setLocalCheckIn(null);

      checkOutMutation.mutate(undefined, {
        onSuccess: () => {
          invalidate();
          onSuccess?.();
        },
        onError: (err) => {
          setLocalCheckIn(prev); // revert
          onError?.(err);
        },
      });
    },
  };
}
