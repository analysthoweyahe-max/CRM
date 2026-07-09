import { useMemo } from 'react';
import { Combobox } from '@/shared/components/form/Combobox';
import { getRoleNameLabel } from '../types/adminRole.types';
import { MANAGER_ROLE_OPTIONS } from '../types/adminManager.types';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  value:             string;
  onChange:          (role: string) => void;
  isAr:              boolean;
  availableRoles?:   ApiRole[];
  allowedRoleNames?: string[];
  disabled?:         boolean;
}

export function RoleSelect({
  value,
  onChange,
  isAr,
  availableRoles = [],
  allowedRoleNames,
  disabled,
}: Props) {
  const items = useMemo(() => {
    const allowed = allowedRoleNames ? new Set(allowedRoleNames) : null;
    const fromApi = availableRoles
      .filter(r => r.name !== 'super-admin' && (!allowed || allowed.has(r.name)))
      .map(r => ({ id: r.name, label: getRoleNameLabel(r.name, isAr) }));

    if (fromApi.length > 0) {
      if (value && !fromApi.some((item) => item.id === value)) {
        return [...fromApi, { id: value, label: getRoleNameLabel(value, isAr) }];
      }
      return fromApi;
    }

    const fallback = MANAGER_ROLE_OPTIONS
      .filter(r => !allowed || allowed.has(r.id))
      .map(r => ({ id: r.id, label: isAr ? r.labelAr : r.labelEn }));

    if (value && !fallback.some((item) => item.id === value)) {
      return [...fallback, { id: value, label: getRoleNameLabel(value, isAr) }];
    }
    return fallback;
  }, [availableRoles, allowedRoleNames, isAr, value]);

  return (
    <Combobox
      items={items}
      value={value}
      onChange={onChange}
      searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
      noResultsText={isAr ? 'لا نتائج' : 'No results'}
      disabled={disabled}
    />
  );
}
