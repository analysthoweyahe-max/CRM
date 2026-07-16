import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Square, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useTaskTimers } from '../hooks/useTaskTimers';
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
          elapsedSeconds={entry.elapsedSeconds}
          isPaused={entry.isPaused}
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

  const entries = useMemo(() => Array.from(timers.values()), [timers]);
  const count = entries.length;
  const running = entries.filter((e) => e.isOpen && !e.isPaused);
  const primary = running[0] ?? entries[0];

  // Collapse by default when there are multiple timers so they don't cover the page.
  const [expanded, setExpanded] = useState(count <= 1);

  useEffect(() => {
    if (count <= 1) setExpanded(true);
    else setExpanded(false);
  }, [count]);

  if (count === 0) return null;

  const summaryLabel = isAr
    ? `${count} مؤقت${count === 1 ? '' : 'ات'}`
    : `${count} timer${count === 1 ? '' : 's'}`;

  const runningLabel = isAr
    ? `${running.length} قيد التشغيل`
    : `${running.length} running`;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 w-[min(100vw-2rem,22rem)]"
      style={{ transform: 'translateX(-50%)' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="rounded-2xl border-2 border-[#A0CD39] bg-white dark:bg-gray-900
                      shadow-lg shadow-[#A0CD39]/20 overflow-hidden">
        {/* Collapsed / header bar — always visible */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 text-start
                     hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          aria-expanded={expanded}
        >
          <div className="w-8 h-8 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20
                          flex items-center justify-center shrink-0">
            <Clock size={16} className="text-[#709028] dark:text-[#A0CD39]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              {count === 1 && primary
                ? primary.title
                : summaryLabel}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {count > 1 && <span>{runningLabel}</span>}
              {primary && (
                <ElapsedDisplay
                  elapsedSeconds={primary.elapsedSeconds}
                  isPaused={primary.isPaused}
                  className="font-mono font-semibold tabular-nums text-gray-700 dark:text-gray-200"
                />
              )}
            </div>
          </div>

          <span className="shrink-0 text-gray-400 dark:text-gray-500">
            {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </span>
        </button>

        {/* Expanded list */}
        {expanded && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-2 py-2
                          max-h-[min(40vh,20rem)] overflow-y-auto space-y-2">
            {entries.map((entry) => (
              <TimerRow key={entry.taskId} entry={entry} isAr={isAr} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
