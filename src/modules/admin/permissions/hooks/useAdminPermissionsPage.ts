import { useMemo } from 'react';
import { PANEL_PERMISSION_GROUPS, PANEL_PERMISSION_SLUGS } from '@/shared/permissions/panelPermissionCatalog';
import { usePermissionList } from './usePermissions';

export interface PermissionCatalogGroup {
  key:     string;
  labelAr: string;
  labelEn: string;
  slugs:   string[];
}

// Hidden per request — stray/test backend permissions, not meant to show up yet.
const HIDDEN_OTHER_SLUGS = new Set(['متابعة', 'custom-permission']);

export function useAdminPermissionsPage() {
  const { data: apiPermissions, isLoading } = usePermissionList();

  const groups = useMemo<PermissionCatalogGroup[]>(() => {
    const catalogGroups: PermissionCatalogGroup[] = PANEL_PERMISSION_GROUPS.map((g) => ({
      key:     g.key,
      labelAr: g.labelAr,
      labelEn: g.labelEn,
      slugs:   g.slugs.map((s) => s.slug),
    }));

    const otherSlugs = [...new Set(
      (apiPermissions ?? [])
        .map((p) => p.name)
        .filter((name) => !PANEL_PERMISSION_SLUGS.has(name) && !HIDDEN_OTHER_SLUGS.has(name)),
    )].sort();

    if (otherSlugs.length > 0) {
      catalogGroups.push({
        key:     'other',
        labelAr: 'صلاحيات أخرى',
        labelEn: 'Other',
        slugs:   otherSlugs,
      });
    }

    return catalogGroups;
  }, [apiPermissions]);

  const totalCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.slugs.length, 0),
    [groups],
  );

  return { groups, totalCount, isLoading };
}
