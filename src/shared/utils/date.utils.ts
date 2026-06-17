export function formatDate(date: string | Date, locale = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}
