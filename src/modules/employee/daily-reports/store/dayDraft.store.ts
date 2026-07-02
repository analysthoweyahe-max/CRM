// Bridges the "Start Day" and "End Day" forms into one combined submission,
// since the real API only exposes a single daily-report endpoint (no separate
// start/end checkpoints). Backed by sessionStorage so it survives tab switches.

export interface DayDraft {
  checkInAt:    string;
  notes:        string;
  plannedTasks: { id: string; name: string; hours: number }[];
}

const KEY = 'emp-day-draft';

export function saveDayDraft(draft: DayDraft): void {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function getDayDraft(): DayDraft | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as DayDraft; }
  catch { return null; }
}

export function clearDayDraft(): void {
  sessionStorage.removeItem(KEY);
}
