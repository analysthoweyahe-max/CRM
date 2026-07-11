import { env } from '@/app/config/env';

const API_ORIGIN = (() => {
  try { return new URL(env.apiBaseUrl).origin; } catch { return ''; }
})();

/** Rewrite absolute URLs that point at localhost / relative storage paths onto the API origin. */
export function buildAuthMediaUrl(url?: string | null): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || !parsed.host) {
      return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
