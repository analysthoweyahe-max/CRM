import { useEffect, useRef, useState } from 'react';

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
] as const;

const MAX_VOICE_BYTES = 20 * 1024 * 1024; // 20 MB

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return PREFERRED_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
}

function extensionForMime(mime: string): string {
  if (mime.includes('mp4') || mime.includes('aac') || mime.includes('m4a')) return 'm4a';
  return 'webm';
}

export interface VoiceRecordingResult {
  file: File;
  durationSeconds: number;
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeRef = useRef<string>('audio/webm');

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function resetLocal() {
    clearTimer();
    stopTracks();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setElapsedSeconds(0);
  }

  useEffect(() => () => {
    try {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } catch {
      /* ignore */
    }
    resetLocal();
  }, []);

  async function start(): Promise<boolean> {
    setError(null);
    if (typeof MediaRecorder === 'undefined') {
      setError('MediaRecorder unsupported');
      return false;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone unavailable');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      mimeRef.current = mimeType ?? 'audio/webm';
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
      setIsRecording(true);
      clearTimer();
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
      }, 250);
      recorder.start(250);
      return true;
    } catch {
      resetLocal();
      setError('Microphone permission denied');
      return false;
    }
  }

  function cancel() {
    try {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.stop();
      }
    } catch {
      /* ignore */
    }
    resetLocal();
  }

  function stop(): Promise<VoiceRecordingResult | null> {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      resetLocal();
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const durationSeconds = Math.min(
          600,
          Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
        );
        const mime = mimeRef.current || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        resetLocal();

        if (!blob.size) {
          resolve(null);
          return;
        }
        if (blob.size > MAX_VOICE_BYTES) {
          setError('Voice message too large (max 20 MB)');
          resolve(null);
          return;
        }

        const file = new File(
          [blob],
          `voice-${Date.now()}.${extensionForMime(mime)}`,
          { type: mime },
        );
        resolve({ file, durationSeconds });
      };

      try {
        recorder.stop();
      } catch {
        resetLocal();
        resolve(null);
      }
    });
  }

  return {
    isRecording,
    elapsedSeconds,
    error,
    start,
    stop,
    cancel,
    maxBytes: MAX_VOICE_BYTES,
  };
}
