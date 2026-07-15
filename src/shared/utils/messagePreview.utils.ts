/** Conversation list / reply snippet helpers for messenger messages. */

export function voiceMessageLabel(isAr: boolean): string {
  return isAr ? 'رسالة صوتية' : 'Voice message';
}

export function messageSnippet(
  msg: {
    type?: string | null;
    body?: string | null;
    durationSeconds?: number | null;
    attachments?: Array<{ name?: string | null; fileName?: string | null }> | null;
  } | null | undefined,
  isAr: boolean,
): string {
  if (!msg) return '';
  if (msg.type === 'voice') return voiceMessageLabel(isAr);
  const body = msg.body?.trim();
  if (body) return body;
  const fileName = msg.attachments?.[0]?.name ?? msg.attachments?.[0]?.fileName;
  if (fileName) return fileName;
  return isAr ? 'مرفق' : 'Attachment';
}

export function conversationLastMessagePreview(
  msg: {
    type?: string | null;
    body?: string | null;
    attachments?: Array<{ name?: string | null; fileName?: string | null }> | null;
  },
  fallback?: string | null,
  isAr = false,
): string {
  if (msg.type === 'voice') return voiceMessageLabel(isAr);
  return (
    msg.body?.trim()
    || msg.attachments?.[0]?.name
    || msg.attachments?.[0]?.fileName
    || fallback
    || ''
  );
}
