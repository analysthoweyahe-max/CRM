const PALETTE = [
  '#A0CD39', '#38BDF8', '#F59E0B', '#F43F5E', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1',
];

/** Deterministic color for a column that has no admin-configured color
 *  (e.g. project phases, unlike statuses which usually carry one). */
export function colorForKey(key: string): string {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return PALETTE[hash % PALETTE.length];
}
