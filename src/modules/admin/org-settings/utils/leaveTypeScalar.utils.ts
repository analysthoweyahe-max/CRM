import type { OrgSettings } from '../types/orgSettings.types';

/** Leave-type values whose `days` also duplicate a top-level scalar field in `OrgSettings`. */
export const LEAVE_TYPE_SCALAR_FIELD: Record<string, keyof Pick<OrgSettings, 'annualLeave' | 'casualLeave' | 'sickLeave'>> = {
  annual: 'annualLeave',
  casual: 'casualLeave',
  sick:   'sickLeave',
};

/** Keep the top-level annual/casual/sick scalars equal to their matching `leaveTypes[].days` entry. */
export function syncScalarLeaveFields(settings: OrgSettings): OrgSettings {
  const next = { ...settings };
  for (const type of settings.leaveTypes ?? []) {
    const scalarKey = LEAVE_TYPE_SCALAR_FIELD[type.value];
    if (scalarKey) next[scalarKey] = type.days ?? 0;
  }
  return next;
}
