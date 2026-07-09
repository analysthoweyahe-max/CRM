import type { NavChildDef, NavItemDef, NavSectionDef } from './appSidebar.types';

type CanFn = (permission: string | string[], match?: 'any' | 'all') => boolean;
type HasRoleFn = (role: string | string[]) => boolean;

function slugs(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function isVisible(
  entry: { permission?: string | string[]; permissions?: string[]; role?: string | string[]; roles?: string[] },
  can: CanFn,
  hasRole: HasRoleFn,
): boolean {
  const roleSlugs = [...slugs(entry.role), ...(entry.roles ?? [])];
  if (roleSlugs.length > 0 && !hasRole(roleSlugs)) return false;

  const permSlugs = [...slugs(entry.permission), ...(entry.permissions ?? [])];
  if (permSlugs.length > 0 && !can(permSlugs)) return false;

  return true;
}

function filterChildren(children: NavChildDef[], can: CanFn, hasRole: HasRoleFn): NavChildDef[] {
  return children.filter((child) => isVisible(child, can, hasRole));
}

function filterItems(items: NavItemDef[], can: CanFn, hasRole: HasRoleFn): NavItemDef[] {
  return items.flatMap((item) => {
    if (!isVisible(item, can, hasRole)) return [];

    if (item.children?.length) {
      const children = filterChildren(item.children, can, hasRole);
      if (children.length === 0) return [];
      return [{ ...item, children }];
    }

    return [item];
  });
}

export function filterNavSections(
  sections: NavSectionDef[],
  can: CanFn,
  hasRole: HasRoleFn,
): NavSectionDef[] {
  return sections.flatMap((section) => {
    if (!isVisible(section, can, hasRole)) return [];

    const items = filterItems(section.items, can, hasRole);
    if (items.length === 0) return [];

    return [{ ...section, items }];
  });
}
