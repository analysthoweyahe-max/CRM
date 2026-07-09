let audioCtx: AudioContext | null = null;

/** Short two-tone chime played on a genuinely new notification. Synthesized
 * via Web Audio API — no audio asset file needed. */
export function playNotificationSound(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') void audioCtx.resume();

    const ctx = audioCtx;
    const now = ctx.currentTime;

    [{ freq: 880, start: 0, dur: 0.12 }, { freq: 1320, start: 0.1, dur: 0.15 }].forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.2, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
  } catch {
    // Autoplay-policy or unsupported-browser failures are non-critical — sound is an enhancement, not core functionality.
  }
}
