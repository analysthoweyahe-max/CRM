// Normalizes a list-endpoint payload into an array. Some endpoints in this
// backend return the array directly; others wrap it in a paginated
// `{ data: [...] }` shape even when the Postman sample showed a flat array.
// Falling back to [] instead of crashing keeps the UI alive if the shape
// doesn't match what was confirmed.
export function toApiArray<T>(payload: unknown): T[] {
  return extractPaginatedList<T>(payload);
}

/** Walk common Laravel / CRM pagination shapes to find the items array. */
export function extractPaginatedList<T>(payload: unknown): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];

  if (typeof payload !== 'object') return [];

  const root = payload as Record<string, unknown>;

  // API envelope: { status, data: ... }
  const inner = root.data !== undefined ? root.data : payload;

  if (Array.isArray(inner)) return inner as T[];

  if (inner && typeof inner === 'object') {
    const page = inner as Record<string, unknown>;

    for (const key of ['data', 'messages', 'items', 'results'] as const) {
      if (Array.isArray(page[key])) return page[key] as T[];
    }

    // Double-wrapped paginator: { data: { data: [...] } }
    if (page.data && typeof page.data === 'object') {
      const nested = page.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
      for (const key of ['messages', 'items'] as const) {
        if (Array.isArray(nested[key])) return nested[key] as T[];
      }
    }
  }

  return [];
}
