import { useMemo } from 'react';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import { getRoleNameLabel } from '../types/adminRole.types';
import { MANAGER_ROLE_OPTIONS } from '../types/adminManager.types';
import { normalizeManagerRoleSlugs } from '../utils/role.utils';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  values:            string[];
  onChange:          (roles: string[]) => void;
  isAr:              boolean;
  availableRoles?:   ApiRole[];
  /** When set, only these slugs appear. Empty array = no assignable roles (disabled). */
  allowedRoleNames?: string[];
  disabled?:         boolean;
}

/**
 * Multi-role select for admin create/edit.
 * Combobox `id` / form values = role.name (English slug, e.g. "hr-manager").
 * Visible label = localized translation only.
 */
export function RoleSelect({
  values,
  onChange,
  isAr,
  availableRoles = [],
  allowedRoleNames,
  disabled,
}: Props) {
  const normalizedValues = useMemo(
    () => normalizeManagerRoleSlugs(values, availableRoles),
    [values, availableRoles],
  );

  const items = useMemo(() => {
    const allowed = allowedRoleNames ? new Set(allowedRoleNames) : null;
    const fromApi = availableRoles
      .filter((r) => r.name !== 'super-admin' && (!allowed || allowed.has(r.name)))
      .map((r) => ({
        id:    r.name, // ← always the English slug sent to the API
        label: getRoleNameLabel(r.name, isAr),
      }));

    const base = fromApi.length > 0
      ? fromApi
      // Fallback only while /v1/roles is empty — still uses English slugs as ids.
      : MANAGER_ROLE_OPTIONS
          .filter((r) => !allowed || allowed.has(r.id))
          .map((r) => ({ id: r.id, label: isAr ? r.labelAr : r.labelEn }));

    // Keep currently selected roles visible even if outside the fetched/allowed list.
    const missing = normalizedValues
      .filter((slug) => !base.some((item) => item.id === slug))
      .map((slug) => ({ id: slug, label: getRoleNameLabel(slug, isAr) }));

    return missing.length > 0 ? [...base, ...missing] : base;
  }, [availableRoles, allowedRoleNames, isAr, normalizedValues]);

  const noAssignable = allowedRoleNames !== undefined && allowedRoleNames.length === 0;

  return (
    <MultiCombobox
      items={items}
      values={normalizedValues}
      onChange={(next) => onChange(normalizeManagerRoleSlugs(next, availableRoles))}
      placeholder={isAr ? 'اختر دوراً أو أكثر' : 'Select one or more roles'}
      searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
      noResultsText={isAr ? 'لا نتائج' : 'No results'}
      disabled={disabled || noAssignable || items.length === 0}
    />
  );
}
