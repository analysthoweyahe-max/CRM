/** Trim, drop blanks, and de-dupe while preserving order. */
export function normalizeImportantLinks(links: string[] | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of links ?? []) {
    const link = raw.trim();
    if (!link || seen.has(link)) continue;
    seen.add(link);
    out.push(link);
  }
  return out;
}

/** Accepts http(s) absolute URLs only. */
export function isValidImportantLink(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns an error message if any non-empty entry is not a valid URL.
 * Empty slots are ignored (field is optional; blanks are stripped on submit).
 */
export function validateImportantLinks(
  links: string[] | null | undefined,
  isAr: boolean,
): string | null {
  for (const raw of links ?? []) {
    const link = raw.trim();
    if (!link) continue;
    if (!isValidImportantLink(link)) {
      return isAr ? 'كل رابط يجب أن يكون URL صالحاً' : 'Each link must be a valid URL';
    }
  }
  return null;
}

function linkFromUnknown(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['url', 'link', 'href', 'value'] as const) {
      const candidate = record[key];
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return null;
}

function coerceLinkList(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    // Some payloads store a JSON-encoded array as a string.
    if (trimmed.startsWith('[')) {
      try {
        return coerceLinkList(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  if (Array.isArray(value)) {
    return value.map(linkFromUnknown).filter((v): v is string => !!v);
  }
  if (typeof value === 'object') {
    // Laravel sometimes serializes indexed arrays as objects: { "0": "...", "1": "..." }
    return Object.values(value as Record<string, unknown>)
      .map(linkFromUnknown)
      .filter((v): v is string => !!v);
  }
  return [];
}

/** Read `importantLinks` from API payloads (camelCase or snake_case). */
export function parseImportantLinks(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object') return [];
  const record = raw as Record<string, unknown>;
  const value = record.importantLinks ?? record.important_links;
  return normalizeImportantLinks(coerceLinkList(value));
}

/** Append as `importantLinks[i]` for multipart create endpoints. */
export function appendImportantLinks(fd: FormData, links: string[] | null | undefined): void {
  normalizeImportantLinks(links).forEach((link, i) => {
    fd.append(`importantLinks[${i}]`, link);
  });
}
