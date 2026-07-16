import { useEffect, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useTaskTimers } from '../hooks/useTaskTimers';
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
 * Local second ticker. Re-baselines from props when the server pushes a new
 * elapsedSeconds / pause state — without remounting (remount caused visible snaps).
 */
interface ElapsedDisplayProps {
  elapsedSeconds: number;
  isPaused:       boolean;
  className?:     string;
}

export function ElapsedDisplay({
  elapsedSeconds, isPaused,
  className = 'font-mono text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200',
}: ElapsedDisplayProps) {
  const [elapsed, setElapsed] = useState(elapsedSeconds);

  useEffect(() => {
    setElapsed(elapsedSeconds);
  }, [elapsedSeconds, isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isPaused]);

  return <span className={className}>{formatElapsed(elapsed)}</span>;
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
        elapsedSeconds={entry.elapsedSeconds}
        isPaused={entry.isPaused}
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
