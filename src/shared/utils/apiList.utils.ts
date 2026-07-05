// Normalizes a list-endpoint payload into an array. Some endpoints in this
// backend return the array directly; others wrap it in a paginated
// `{ data: [...] }` shape even when the Postman sample showed a flat array.
// Falling back to [] instead of crashing keeps the UI alive if the shape
// doesn't match what was confirmed.
export function toApiArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}
