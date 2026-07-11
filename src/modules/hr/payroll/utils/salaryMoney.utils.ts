/** Format payroll amounts — 2 decimal places + EGP / ج.م */
export function formatMoney(amount: number, isAr: boolean): string {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const formatted = safe.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${isAr ? 'ج.م' : 'EGP'}`;
}
