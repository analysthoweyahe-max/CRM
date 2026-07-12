import { useMemo } from 'react';
import { PermissionChip } from './PermissionChip';
import { PERMISSION_GROUPS } from '../types/adminRole.types';
import { PANEL_PERMISSION_SLUGS } from '@/shared/permissions/panelPermissionCatalog';
import { EMPLOYEE_PERMISSION_SLUGS } from '@/shared/permissions/employeePermissionCatalog';
import { getPermissionLabel } from '@/shared/permissions/permissionLabel.utils';
import { filterRegisteredPermissions, toPermissionNameSet } from '@/shared/permissions/permissionValidation.utils';
import { usePermissionList } from '@/modules/admin/permissions/hooks/usePermissions';
import type { PermissionGroup } from '../types/adminRole.types';

interface Props {
  selected:   string[];
  onToggle:   (slug: string) => void;
  isAr:       boolean;
  /** Spatie guard to fetch the live permission catalogue for. Defaults to 'admin'. */
  guardName?: string;
  /** Curated group catalogue to render. Defaults to the admin-guard panel catalogue. */
  groups?:    PermissionGroup[];
}

export function PermissionGroupList({ selected, onToggle, isAr, guardName = 'admin', groups }: Props) {
  const catalogGroups = groups ?? PERMISSION_GROUPS;
  const catalogSlugSet = guardName === 'employee' ? EMPLOYEE_PERMISSION_SLUGS : PANEL_PERMISSION_SLUGS;

  const { data: allPermissions } = usePermissionList(guardName);
  const registered = useMemo(() => toPermissionNameSet(allPermissions), [allPermissions]);

  const visibleGroups = useMemo(
    () => catalogGroups.map((group) => ({
      ...group,
      slugs: group.slugs.filter(({ slug }) =>
        registered.size === 0
          ? catalogSlugSet.has(slug)
          : registered.has(slug) || selected.includes(slug),
      ),
    })).filter((group) => group.slugs.length > 0),
    [catalogGroups, catalogSlugSet, registered, selected],
  );

  const catalogSlugs = useMemo(
    () => new Set(catalogGroups.flatMap((group) => group.slugs.map((s) => s.slug))),
    [catalogGroups],
  );

  // Any permission created via the Permissions page that isn't part of the curated
  // catalogue above still needs to be selectable here — group it under "Other".
  const otherSlugs = useMemo(() => {
    const fromApi = (allPermissions ?? [])
      .map((p) => p.name)
      .filter((name) => !catalogSlugSet.has(name));
    const fromSelected = selected.filter(
      (slug) => !catalogSlugs.has(slug) && !fromApi.includes(slug),
    );
    return [...new Set([...fromApi, ...fromSelected])];
  }, [allPermissions, selected, catalogSlugs, catalogSlugSet]);

  const visibleSelected = useMemo(
    () => filterRegisteredPermissions(selected, registered.size ? registered : undefined),
    [selected, registered],
  );

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
      {visibleGroups.map((group) => (
        <div key={group.key} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {group.slugs.map(({ slug, labelAr, labelEn }) => (
              <PermissionChip
                key={slug}
                label={isAr ? labelAr : labelEn}
                active={visibleSelected.includes(slug)}
                onToggle={() => onToggle(slug)}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
            {isAr ? group.labelAr : group.labelEn}
          </span>
        </div>
      ))}

      {otherSlugs.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {otherSlugs.map((slug) => (
              <PermissionChip
                key={slug}
                label={getPermissionLabel(slug, isAr)}
                active={visibleSelected.includes(slug)}
                onToggle={() => onToggle(slug)}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
            {isAr ? 'أخرى' : 'Other'}
          </span>
        </div>
      )}
    </div>
  );
}
