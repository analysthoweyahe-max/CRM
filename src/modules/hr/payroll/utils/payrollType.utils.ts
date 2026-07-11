import type {
  ApiPayrollAdjustmentType,
  PayrollTypeListResponse,
  PayrollTypeLookupItem,
} from '../types/payroll.types';

export function unwrapPayrollTypeList(
  data: PayrollTypeListResponse['data'],
): ApiPayrollAdjustmentType[] {
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

export function payrollLookupLabel(
  t: Pick<PayrollTypeLookupItem, 'label' | 'name' | 'nameAr' | 'code' | 'value'>,
  isAr: boolean,
): string {
  if (isAr) return t.label || t.nameAr || t.name || t.code || t.value || '';
  return t.name || t.label || t.code || t.value || '';
}

/** Prefer uuid for create payloads */
export function payrollLookupSelectId(
  t: Pick<PayrollTypeLookupItem, 'id' | 'code' | 'value'>,
): string {
  return t.id || t.code || t.value || '';
}

/** Prefer code for list filters (adjustment_type / deduction_type) */
export function payrollLookupFilterId(
  t: Pick<PayrollTypeLookupItem, 'id' | 'code' | 'value'>,
): string {
  return t.code || t.value || t.id || '';
}

export function payrollRecordTypeLabel(
  type: { label?: string } | null | undefined,
  fallback?: string | null,
): string {
  return type?.label || fallback || '—';
}
