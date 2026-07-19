import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { liveElapsedSeconds, useTaskTimers } from '../hooks/useTaskTimers';
import type { TimerPortal } from '../types/taskTimer.types';

interface Props {
  portal:    TimerPortal;
  projectId: string;
  taskId:    string;
  title:     string;
  isAr:      boolean;
  size?:     'sm' | 'md';
}

function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h   = Math.floor(s / 3600).toString().padStart(2, '0');
  const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

/**
 * Local second ticker based on a wall-clock baseline.
 * Re-baselines when the server / parent pushes a new elapsedSeconds or syncKey
 * (e.g. after remount when expanding the floating list).
 */
interface ElapsedDisplayProps {
  elapsedSeconds: number;
  isPaused:       boolean;
  /** Changes when the entry was last synced — keeps remounts accurate. */
  syncKey?:       number | string;
  className?:     string;
}

export function ElapsedDisplay({
  elapsedSeconds, isPaused, syncKey,
  className = 'font-mono text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200',
}: ElapsedDisplayProps) {
  const baseRef = useRef({ elapsed: elapsedSeconds, wall: Date.now() });
  const [, setTick] = useState(0);

  useEffect(() => {
    baseRef.current = { elapsed: elapsedSeconds, wall: Date.now() };
    setTick((t) => t + 1);
  }, [elapsedSeconds, isPaused, syncKey]);

  useEffect(() => {
    if (isPaused) return;
    const bump = () => setTick((t) => t + 1);
    const id = setInterval(bump, 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') bump();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [isPaused]);

  const display = isPaused
    ? baseRef.current.elapsed
    : baseRef.current.elapsed + Math.max(0, Math.floor((Date.now() - baseRef.current.wall) / 1000));

  return <span className={className}>{formatElapsed(display)}</span>;
}

export function TimerControls({ portal, projectId, taskId, title, isAr, size = 'sm' }: Props) {
  const { getTimer, startTimer, pauseTimer, resumeTimer, stopTimer } = useTaskTimers();
  const entry = getTimer(taskId);

  if (!entry) {
    return (
      <Button
        variant="primary"
        size={size}
        startIcon={<Play size={13} />}
        onClick={() => startTimer({ portal, projectId, taskId, title })}
      >
        {isAr ? 'بدء المؤقت' : 'Start Timer'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ElapsedDisplay
        elapsedSeconds={liveElapsedSeconds(entry)}
        isPaused={entry.isPaused}
        syncKey={entry.syncedAt}
      />
      {entry.canPause && (
        <Button variant="secondary" size={size} startIcon={<Pause size={13} />} onClick={() => pauseTimer(taskId)}>
          {isAr ? 'إيقاف مؤقت' : 'Pause'}
        </Button>
      )}
      {entry.canResume && (
        <Button variant="primary" size={size} startIcon={<Play size={13} />} onClick={() => resumeTimer(taskId)}>
          {isAr ? 'استئناف' : 'Resume'}
        </Button>
      )}
      {entry.canStop && (
        <Button
          variant="danger"
          size={size}
          startIcon={<Square size={13} fill="currentColor" />}
          onClick={() => stopTimer(taskId)}
        >
          {isAr ? 'إيقاف' : 'Stop'}
        </Button>
      )}
    </div>
  );
}
