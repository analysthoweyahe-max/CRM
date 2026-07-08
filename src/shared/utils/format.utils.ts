export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/** Guards against links stored/typed without a scheme (e.g. "github.com/org/repo"),
 *  which the browser would otherwise resolve as a broken relative path. */
export function ensureHttpUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
