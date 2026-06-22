import { StreamChat } from 'stream-chat';

const API_KEY    = import.meta.env.VITE_STREAM_API_KEY    as string;
const DEV_SECRET = import.meta.env.VITE_STREAM_DEV_SECRET as string | undefined;

export const streamClient = StreamChat.getInstance(API_KEY);

function b64url(input: string): string {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Browser-safe HS256 JWT for Stream Chat.
 * DEV ONLY — in production the backend must generate and return this token.
 */
export async function getStreamToken(userId: string): Promise<string> {
  if (!DEV_SECRET) {
    // Fallback: unsigned dev token (requires "Disable Auth Checks" in Stream Dashboard)
    return streamClient.devToken(userId);
  }

  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ user_id: userId }));
  const data    = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(DEV_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64  = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${sigB64}`;
}
