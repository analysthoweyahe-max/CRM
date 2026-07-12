const CHUNK_RELOAD_KEY    = 'crm:chunk-reload';
const CHUNK_ATTEMPTS_KEY  = 'crm:chunk-reload-attempts';
const RELOAD_COOLDOWN_MS  = 30_000;
const MAX_CHUNK_ATTEMPTS  = 2;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('Loading chunk') ||
    message.includes('Loading CSS chunk') ||
    /ChunkLoadError/i.test(message)
  );
}

function redirectToLogin(): void {
  const loginPath = '/auth/login';
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
}

/** Reload when a stale lazy chunk is detected. Falls back to login after repeated failures. */
export function reloadForStaleChunk(): boolean {
  const lastReload = sessionStorage.getItem(CHUNK_RELOAD_KEY);
  const now = Date.now();
  // A chunk error striking again inside the cooldown means the previous
  // reload didn't fix it — count it as a repeat attempt instead of reloading forever.
  const withinCooldown = !!lastReload && now - Number(lastReload) < RELOAD_COOLDOWN_MS;
  const attempts = withinCooldown ? Number(sessionStorage.getItem(CHUNK_ATTEMPTS_KEY) ?? '0') + 1 : 1;

  if (attempts > MAX_CHUNK_ATTEMPTS) {
    clearChunkReloadFlag();
    redirectToLogin();
    return false;
  }

  sessionStorage.setItem(CHUNK_ATTEMPTS_KEY, String(attempts));
  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
  window.location.reload();
  return true;
}

export function clearChunkReloadFlag(): void {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  sessionStorage.removeItem(CHUNK_ATTEMPTS_KEY);
}
