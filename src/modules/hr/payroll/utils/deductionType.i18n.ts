/**
 * Deduction-type labels come back from the API in English only. Map them to
 * Arabic by their lookup `value` key first, then fall back to the English
 * label text — so translation survives regardless of which the API sends.
 */
const BY_KEY: Record<string, string> = {
  repeated_lateness:    'تكرار التأخير',
  unauthorized_absence: 'غياب بدون إذن',
  early_leave:          'انصراف مبكر',
  leave_limit_exceeded: 'تجاوز حد الإجازات',
  manual_deduction:     'خصم يدوي',
  manual:               'خصم يدوي',
  automatic_deduction:  'خصم تلقائي',
  automatic:            'خصم تلقائي',
  auto:                 'خصم تلقائي',
  insurance:            'تأمينات',
  tax:                  'ضرائب',
  advance:              'سلفة',
  penalty:              'جزاء',
};

const BY_LABEL: Record<string, string> = {
  'repeated lateness':    'تكرار التأخير',
  'unauthorized absence': 'غياب بدون إذن',
  'early leave':          'انصراف مبكر',
  'leave limit exceeded': 'تجاوز حد الإجازات',
  'manual deduction':     'خصم يدوي',
  'automatic deduction':  'خصم تلقائي',
};

function normalize(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

/** Translate a deduction-type label to Arabic when the API returns English only. */
export function translateDeductionType(
  value: string | null | undefined,
  label: string | null | undefined,
  isAr: boolean,
): string {
  const safeLabel = (label ?? '').trim();
  if (!isAr) return safeLabel;

  const byKey = BY_KEY[normalize(value)];
  if (byKey) return byKey;

  const byLabel = BY_LABEL[safeLabel.toLowerCase()] ?? BY_KEY[normalize(safeLabel)];
  if (byLabel) return byLabel;

  return safeLabel;
}
