const ARABIC_DIACRITICS = /[ً-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;

/** Normalizes Arabic text for search matching: strips diacritics/tatweel and
 *  unifies letter variants (e.g. أ/إ/آ → ا) so "احمد" matches "أحمد". */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(ARABIC_DIACRITICS, '')
    .replace(TATWEEL, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim()
    .toLowerCase();
}

export function matchesSearch(fields: Array<string | null | undefined>, query: string): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;
  return fields.some(field => !!field && normalizeSearchText(field).includes(q));
}
