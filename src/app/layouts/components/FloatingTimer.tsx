import { useState } from 'react';
import { Square, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { useTaskTimer } from './TaskTimerContext';

function formatElapsed(s: number): string {
  const h   = Math.floor(s / 3600).toString().padStart(2, '0');
  const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

export function FloatingTimer() {
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const { isRunning, activeTask, elapsed, stopTimer } = useTaskTimer();

  if (!isRunning || !activeTask) return null;

  const taskTitle = isAr ? activeTask.titleAr : activeTask.titleEn;

  function handleStop() {
    stopTimer(() =>
      toast.success(isAr ? 'تم حفظ الجلسة بنجاح ✓' : 'Session saved successfully'),
    );
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex flex-col items-center"
      style={{ transform: 'translateX(-50%)' }}
    >
      {/* ── Expanded panel ── */}
      {expanded && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="mb-2 w-72 rounded-2xl bg-white dark:bg-gray-900
                     border-2 border-[#A0CD39]/60 shadow-xl
                     px-4 py-3 space-y-3
                     animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <p className="text-[11px] font-semibold text-[#709028] dark:text-[#A0CD39] uppercase tracking-wide">
            {isAr ? 'المهمة الجارية' : 'Active task'}
          </p>

          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
            {taskTitle}
          </p>

          <p className="text-xs text-gray-400">{activeTask.project}</p>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{isAr ? 'المدة' : 'Duration'}</span>
            <span className="text-[15px] font-mono font-bold text-gray-800 dark:text-gray-100 tabular-nums">
              {formatElapsed(elapsed)}
            </span>
          </div>

          <button
            onClick={handleStop}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2
                       bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                       hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors
                       text-xs font-semibold"
          >
            <Square size={11} fill="currentColor" />
            {isAr ? 'إيقاف وحفظ الجلسة' : 'Stop & save session'}
          </button>
        </div>
      )}

      {/* ── Compact bar ── */}
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl
                   bg-white dark:bg-gray-900
                   border-2 border-[#A0CD39] shadow-lg shadow-[#A0CD39]/20"
      >
        {/* Stop button */}
        <button
          onClick={handleStop}
          title={isAr ? 'إيقاف الجلسة' : 'Stop session'}
          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 active:scale-95
                     flex items-center justify-center transition-all shrink-0"
        >
          <Square size={12} fill="white" className="text-white" />
        </button>

        {/* Timer */}
        <span className="font-mono text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100 min-w-[70px] text-center">
          {formatElapsed(elapsed)}
        </span>

        {/* Clock badge */}
        <div className="w-7 h-7 rounded-full bg-[#D8EBAE] dark:bg-[#A0CD39]/20 flex items-center justify-center shrink-0">
          <Clock size={14} className="text-[#709028] dark:text-[#A0CD39]" />
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(p => !p)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
    </div>
  );
}
