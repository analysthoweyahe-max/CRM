/** Keep only permission slugs that exist in the backend catalogue (Spatie). */
export function filterRegisteredPermissions(
  selected: string[],
  registered: Iterable<string> | undefined,
): string[] {
  if (!registered) return selected;
  const set = registered instanceof Set ? registered : new Set(registered);
  return selected.filter((slug) => set.has(slug));
}

export function toPermissionNameSet(permissions: { name: string }[] | undefined): Set<string> {
  return new Set((permissions ?? []).map((p) => p.name));
}
