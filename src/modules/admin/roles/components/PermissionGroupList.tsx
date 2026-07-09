import { useMemo } from 'react';
import { PermissionChip } from './PermissionChip';
import { PERMISSION_GROUPS } from '../types/adminRole.types';
import { PANEL_PERMISSION_SLUGS } from '@/shared/permissions/panelPermissionCatalog';
import { filterRegisteredPermissions, toPermissionNameSet } from '@/shared/permissions/permissionValidation.utils';
import { usePermissionList } from '@/modules/admin/permissions/hooks/usePermissions';

interface Props {
  selected: string[];
  onToggle: (slug: string) => void;
  isAr:     boolean;
}

export function PermissionGroupList({ selected, onToggle, isAr }: Props) {
  const { data: allPermissions } = usePermissionList();
  const registered = useMemo(() => toPermissionNameSet(allPermissions), [allPermissions]);

  const visibleGroups = useMemo(
    () => PERMISSION_GROUPS.map((group) => ({
      ...group,
      slugs: group.slugs.filter(({ slug }) =>
        registered.size === 0 ? PANEL_PERMISSION_SLUGS.has(slug) : registered.has(slug),
      ),
    })).filter((group) => group.slugs.length > 0),
    [registered],
  );

  // Any permission created via the Permissions page that isn't part of the curated
  // catalogue above still needs to be selectable here — group it under "Other".
  const otherSlugs = useMemo(
    () => (allPermissions ?? [])
      .map((p) => p.name)
      .filter((name) => !PANEL_PERMISSION_SLUGS.has(name)),
    [allPermissions],
  );

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
                label={slug}
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
