import { formatMoneyAmount } from '@/shared/utils/number.utils';

/** Format payroll amounts — 2 decimal places + EGP / ج.م */
export function formatMoney(amount: number | null | undefined, isAr: boolean): string {
  return formatMoneyAmount(amount, isAr);
}
