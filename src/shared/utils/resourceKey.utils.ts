/** Prefer API uuid path params; fall back to numeric id when uuid is missing. */
export function resourceKey(entity: { uuid?: string | null; id: number | string } | null | undefined): string {
  if (!entity) return '';
  const uuid = entity.uuid?.trim();
  return uuid || String(entity.id);
}

/** Task routes expect taskUuid when available. */
export function taskResourceKey(task: { uuid?: string | null; id: number | string } | null | undefined): string {
  return resourceKey(task);
}

/**
 * Build a partial payload with only fields that differ from the baseline.
 * Skips keys whose new value is `undefined`.
 */
export function pickChangedFields<T extends Record<string, unknown>>(
  next: T,
  baseline: Partial<Record<keyof T, unknown>>,
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(next) as (keyof T)[]) {
    const value = next[key];
    if (value === undefined) continue;
    if (!Object.is(value, baseline[key])) {
      out[key] = value;
    }
  }
  return out;
}
