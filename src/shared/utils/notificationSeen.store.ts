import { parseBackendTimestamp } from '@/shared/utils/date.utils';

const STORAGE_KEY = 'crm:toasted-notifications';
const MAX_ENTRIES = 300;

function readIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>): void {
  try {
    const arr = [...ids].slice(-MAX_ENTRIES);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // sessionStorage unavailable
  }
}

/** Whether this notification was already shown as an in-page toast this session. */
export function wasNotificationToasted(id: string): boolean {
  if (!id) return false;
  return readIds().has(id);
}

/** Remember that we already toasted this notification. */
export function markNotificationToasted(id: string): void {
  if (!id) return;
  const ids = readIds();
  ids.add(id);
  writeIds(ids);
}

/** Seed on first load — existing list items should never pop a toast. */
export function markNotificationsToasted(ids: string[]): void {
  if (!ids.length) return;
  const set = readIds();
  ids.forEach(id => { if (id) set.add(id); });
  writeIds(set);
}

/** Only toast notifications created within this window (avoids stale unread resurfacing). */
export function isRecentlyCreated(createdAt: string | undefined, windowMs = 180_000): boolean {
  if (!createdAt) return false;
  const t = parseBackendTimestamp(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= windowMs;
}
