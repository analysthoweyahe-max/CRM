import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Square, Clock, X } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { liveElapsedSeconds, useTaskTimers } from '../hooks/useTaskTimers';
import type { TimerEntry } from '../hooks/useTaskTimers';
import { ElapsedDisplay } from './TimerControls';

function TimerRow({ entry, isAr }: { entry: TimerEntry; isAr: boolean }) {
  const { pauseTimer, resumeTimer, stopTimer } = useTaskTimers();

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                 bg-white dark:bg-gray-900
                 border border-[#A0CD39]/60 dark:border-[#A0CD39]/40"
    >
      {entry.canStop && (
        <button
          type="button"
          onClick={() => stopTimer(entry.taskId)}
          title={isAr ? 'إيقاف الجلسة' : 'Stop session'}
          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 active:scale-95
                     flex items-center justify-center transition-all shrink-0"
        >
          <Square size={12} fill="white" className="text-white" />
        </button>
      )}
      {entry.canPause && (
        <button
          type="button"
          onClick={() => pauseTimer(entry.taskId)}
          title={isAr ? 'إيقاف مؤقت' : 'Pause'}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95
                     flex items-center justify-center transition-all shrink-0"
        >
          <Pause size={12} className="text-gray-700 dark:text-gray-200" />
        </button>
      )}
      {entry.canResume && (
        <button
          type="button"
          onClick={() => resumeTimer(entry.taskId)}
          title={isAr ? 'استئناف' : 'Resume'}
          className="w-8 h-8 rounded-full bg-[#A0CD39] hover:brightness-95 active:scale-95
                     flex items-center justify-center transition-all shrink-0"
        >
          <Play size={12} className="text-gray-900" />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
          {entry.title}
        </p>
        <ElapsedDisplay
          elapsedSeconds={liveElapsedSeconds(entry)}
          isPaused={entry.isPaused}
          syncKey={entry.syncedAt}
          className="font-mono text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100"
        />
      </div>

      <div className="w-7 h-7 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20 flex items-center justify-center shrink-0">
        <Clock size={14} className="text-[#709028] dark:text-[#A0CD39]" />
      </div>
    </div>
  );
}

export function FloatingTimer() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { timers } = useTaskTimers();
  const rootRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(() => Array.from(timers.values()), [timers]);
  const count = entries.length;
  const running = entries.filter((e) => e.isOpen && !e.isPaused);
  const primary = running[0] ?? entries[0];
  const anyRunning = running.length > 0;

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (count === 0) setExpanded(false);
  }, [count]);

  useEffect(() => {
    if (!expanded) return;
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [expanded]);

  if (count === 0) return null;

  const summaryLabel = isAr
    ? `${count} مؤقت${count === 1 ? '' : 'ات'}`
    : `${count} timer${count === 1 ? '' : 's'}`;

  const runningLabel = isAr
    ? `${running.length} قيد التشغيل`
    : `${running.length} running`;

  return (
    <div
      ref={rootRef}
      className="fixed bottom-6 inset-e-6 z-50 flex flex-col items-end gap-3"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Expandable panel — grows above the icon */}
      {expanded && (
        <div
          className="w-[min(100vw-2rem,22rem)] rounded-2xl border-2 border-[#A0CD39]
                     bg-white dark:bg-gray-900 shadow-lg shadow-[#A0CD39]/20 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20
                            flex items-center justify-center shrink-0">
              <Clock size={16} className="text-[#709028] dark:text-[#A0CD39]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {count === 1 && primary ? primary.title : summaryLabel}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {count > 1 && <span>{runningLabel}</span>}
                {primary && (
                  <ElapsedDisplay
                    elapsedSeconds={liveElapsedSeconds(primary)}
                    isPaused={primary.isPaused}
                    syncKey={primary.syncedAt}
                    className="font-mono font-semibold tabular-nums text-gray-700 dark:text-gray-200"
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-2 py-2 max-h-[min(50vh,24rem)] overflow-y-auto space-y-2">
            {entries.map((entry) => (
              <TimerRow key={entry.taskId} entry={entry} isAr={isAr} />
            ))}
          </div>
        </div>
      )}

      {/* Side FAB icon */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={isAr ? 'مؤقت المهام' : 'Task timers'}
        title={
          primary
            ? `${count === 1 ? primary.title : summaryLabel}`
            : (isAr ? 'مؤقت المهام' : 'Task timers')
        }
        className={[
          'relative w-14 h-14 rounded-full border-2 border-[#A0CD39]',
          'bg-white dark:bg-gray-900 shadow-lg shadow-[#A0CD39]/25',
          'flex flex-col items-center justify-center gap-0.5',
          'hover:scale-105 active:scale-95 transition-transform',
          anyRunning ? 'ring-2 ring-[#A0CD39]/30' : '',
        ].join(' ')}
      >
        {anyRunning && (
          <span className="absolute inset-0 rounded-full bg-[#A0CD39]/15 animate-ping pointer-events-none" />
        )}
        <Clock size={20} className="text-[#709028] dark:text-[#A0CD39] relative" />
        {primary && !expanded && (
          <ElapsedDisplay
            elapsedSeconds={liveElapsedSeconds(primary)}
            isPaused={primary.isPaused}
            syncKey={primary.syncedAt}
            className="relative font-mono text-[9px] font-bold tabular-nums leading-none text-[#709028] dark:text-[#A0CD39]"
          />
        )}
        <span
          className="absolute -top-1 -inset-s-1 min-w-5 h-5 px-1 rounded-full
                     bg-[#A0CD39] text-gray-900 text-[10px] font-bold
                     flex items-center justify-center shadow-sm"
        >
          {count}
        </span>
      </button>
    </div>
  );
}
