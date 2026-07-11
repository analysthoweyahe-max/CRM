import { useMemo } from 'react';
import { Combobox } from '@/shared/components/form/Combobox';
import { getRoleNameLabel } from '../types/adminRole.types';
import { MANAGER_ROLE_OPTIONS } from '../types/adminManager.types';
import { extractRoleSlug } from '../utils/role.utils';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  value:             string;
  onChange:          (role: string) => void;
  isAr:              boolean;
  availableRoles?:   ApiRole[];
  /** When set, only these slugs appear. Empty array = no assignable roles (disabled). */
  allowedRoleNames?: string[];
  disabled?:         boolean;
}

/**
 * Role dropdown for admin create/edit.
 * Combobox `id` / form value = role.name (English slug, e.g. "hr-manager").
 * Visible label = localized translation only.
 */
export function RoleSelect({
  value,
  onChange,
  isAr,
  availableRoles = [],
  allowedRoleNames,
  disabled,
}: Props) {
  const normalizedValue = extractRoleSlug(value, availableRoles) ?? value;

  const items = useMemo(() => {
    const allowed = allowedRoleNames ? new Set(allowedRoleNames) : null;
    const fromApi = availableRoles
      .filter((r) => r.name !== 'super-admin' && (!allowed || allowed.has(r.name)))
      .map((r) => ({
        id:    r.name, // ← always the English slug sent to the API
        label: getRoleNameLabel(r.name, isAr),
      }));

    if (fromApi.length > 0) {
      if (normalizedValue && !fromApi.some((item) => item.id === normalizedValue)) {
        return [
          ...fromApi,
          { id: normalizedValue, label: getRoleNameLabel(normalizedValue, isAr) },
        ];
      }
      return fromApi;
    }

    // Fallback only while /v1/roles is empty — still uses English slugs as ids.
    const fallback = MANAGER_ROLE_OPTIONS
      .filter((r) => !allowed || allowed.has(r.id))
      .map((r) => ({ id: r.id, label: isAr ? r.labelAr : r.labelEn }));

    if (normalizedValue && !fallback.some((item) => item.id === normalizedValue)) {
      return [
        ...fallback,
        { id: normalizedValue, label: getRoleNameLabel(normalizedValue, isAr) },
      ];
    }
    return fallback;
  }, [availableRoles, allowedRoleNames, isAr, normalizedValue]);

  const noAssignable = allowedRoleNames !== undefined && allowedRoleNames.length === 0;

  return (
    <Combobox
      items={items}
      value={normalizedValue}
      onChange={(slug) => onChange(extractRoleSlug(slug, availableRoles) ?? slug)}
      searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
      noResultsText={isAr ? 'لا نتائج' : 'No results'}
      disabled={disabled || noAssignable || items.length === 0}
    />
  );
}
