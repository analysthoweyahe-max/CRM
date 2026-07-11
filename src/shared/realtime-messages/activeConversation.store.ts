/** Tracks which company/HR conversation thread is currently open in the UI. */
let openConversationId: string | null = null;
let openConversationKind: 'company' | 'hr' | null = null;

export function setOpenConversation(
  id: string | null,
  kind: 'company' | 'hr' | null = id ? 'company' : null,
): void {
  openConversationId = id;
  openConversationKind = id ? kind : null;
}

export function getOpenConversationId(): string | null {
  return openConversationId;
}

export function getOpenConversationKind(): 'company' | 'hr' | null {
  return openConversationKind;
}

export function isConversationOpen(id: string | undefined | null, kind?: 'company' | 'hr'): boolean {
  if (!id || !openConversationId) return false;
  if (kind && openConversationKind && kind !== openConversationKind) return false;
  return openConversationId === id;
}
