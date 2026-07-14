import { Pause, Play, Square, Clock } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useTaskTimers } from '../hooks/useTaskTimers';
import type { TimerEntry } from '../hooks/useTaskTimers';
import { ElapsedDisplay } from './TimerControls';

function TimerRow({ entry, isAr }: { entry: TimerEntry; isAr: boolean }) {
  const { pauseTimer, resumeTimer, stopTimer } = useTaskTimers();

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl
                 bg-white dark:bg-gray-900
                 border-2 border-[#A0CD39] shadow-lg shadow-[#A0CD39]/20"
    >
      {entry.canStop && (
        <button
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
          onClick={() => resumeTimer(entry.taskId)}
          title={isAr ? 'استئناف' : 'Resume'}
          className="w-8 h-8 rounded-full bg-[#A0CD39] hover:brightness-95 active:scale-95
                     flex items-center justify-center transition-all shrink-0"
        >
          <Play size={12} className="text-gray-900" />
        </button>
      )}

      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[140px]">
          {entry.title}
        </p>
        <ElapsedDisplay
          key={`${entry.id}-${entry.elapsedSeconds}-${entry.isPaused}`}
          elapsedSeconds={entry.elapsedSeconds}
          isPaused={entry.isPaused}
          className="font-mono text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100"
        />
      </div>

      <div className="w-7 h-7 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20 flex items-center justify-center shrink-0 ms-auto">
        <Clock size={14} className="text-[#709028] dark:text-[#A0CD39]" />
      </div>
    </div>
  );
}

export function FloatingTimer() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { timers } = useTaskTimers();

  const entries = Array.from(timers.values());
  if (entries.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex flex-col items-center gap-2"
      style={{ transform: 'translateX(-50%)' }}
    >
      {entries.map((entry) => (
        <TimerRow key={entry.taskId} entry={entry} isAr={isAr} />
      ))}
    </div>
  );
}
