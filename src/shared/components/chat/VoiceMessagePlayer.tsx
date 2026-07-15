import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { buildAuthMediaUrl } from './authMediaUrl';

interface Props {
  url?: string | null;
  durationSeconds?: number | null;
  isOwn?: boolean;
  isAr?: boolean;
}

function formatDuration(total: number) {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export function VoiceMessagePlayer({ url, durationSeconds, isOwn, isAr = false }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);

  const src = buildAuthMediaUrl(url);

  useEffect(() => {
    setDuration(durationSeconds ?? 0);
    setCurrent(0);
    setPlaying(false);
  }, [src, durationSeconds]);

  if (!src) {
    return (
      <p className={`text-xs ${isOwn ? 'opacity-70' : 'text-gray-400'}`}>
        {isAr ? 'رسالة صوتية' : 'Voice message'}
      </p>
    );
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 min-w-[180px] my-1 ${isOwn ? '' : ''}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => {
          const d = audioRef.current?.duration;
          if (d && Number.isFinite(d) && d > 0) setDuration(Math.round(d));
        }}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
      />
      <button
        type="button"
        onClick={() => { void toggle(); }}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                    ${isOwn
                      ? 'bg-white/40 hover:bg-white/55 text-gray-900'
                      : 'bg-[#D8EBAE]/60 hover:bg-[#D8EBAE] text-[#709028]'}`}
        aria-label={playing ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play')}
      >
        {playing ? <Pause size={14} /> : <Play size={14} className={isAr ? '' : 'ms-0.5'} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`h-1 rounded-full overflow-hidden ${isOwn ? 'bg-black/15' : 'bg-gray-200 dark:bg-gray-600'}`}>
          <div
            className={`h-full rounded-full transition-[width] duration-100 ${isOwn ? 'bg-gray-800/70' : 'bg-[#A0CD39]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={`text-[10px] mt-1 tabular-nums ${isOwn ? 'text-gray-700/70' : 'text-gray-400'}`}>
          {playing || current > 0
            ? `${formatDuration(current)} / ${formatDuration(duration || durationSeconds || 0)}`
            : formatDuration(duration || durationSeconds || 0)}
        </p>
      </div>
    </div>
  );
}
