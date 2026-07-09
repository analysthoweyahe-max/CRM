import type { PmLookupItem } from '../types/project.types';

/**
 * SEO projects don't have a code repository or a hard deadline — instead of a
 * GitHub link + Deadline they carry a Drive folder link + a contract duration.
 * Project types are admin-managed (CRUD) so we can't key off a fixed slug;
 * detect SEO by matching the type's English/Arabic label instead.
 */
export function isSeoLabel(label?: string | null, labelAr?: string | null): boolean {
  const en = (label ?? '').toLowerCase();
  const ar = labelAr ?? '';
  return /seo/.test(en) || ar.includes('سيو') || ar.includes('تحسين محرك');
}

export function isSeoType(typeItems: PmLookupItem[], value: string): boolean {
  const item = typeItems.find(t => t.value === value);
  if (!item) return false;
  return isSeoLabel(item.label, item.labelAr);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Compute a deadline from a start date + a whole number of contract months. */
export function addMonths(dateStr: string, months: number): string {
  if (!dateStr || !months || Number.isNaN(months)) return dateStr;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Guard against month overflow (e.g. Jan 31 + 1 → Mar 3): clamp to month end.
  if (d.getDate() < day) d.setDate(0);
  return toIsoDate(d);
}

/** Derive the contract duration (whole months) from a start date + deadline. */
export function monthsBetween(startStr: string, endStr: string): string {
  if (!startStr || !endStr) return '';
  const s = new Date(`${startStr}T00:00:00`);
  const e = new Date(`${endStr}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (e.getDate() < s.getDate()) months -= 1;
  return months > 0 ? String(months) : '';
}
