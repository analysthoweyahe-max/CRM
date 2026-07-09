import type { ApiMonitoredMessage } from '../types/monitor.types';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** Normalize monitor feed rows from GET /v1/pm/admin/messages. */
export function normalizeMonitoredMessage(raw: Record<string, unknown>): ApiMonitoredMessage {
  const project = raw.project && typeof raw.project === 'object'
    ? raw.project as Record<string, unknown>
    : null;
  const sender = raw.sender && typeof raw.sender === 'object'
    ? raw.sender as Record<string, unknown>
    : null;

  const senderName = readString(sender?.name);
  const projectName = readString(raw.projectName) ?? readString(project?.name);
  const projectId = raw.projectId ?? project?.id ?? null;

  const createdAt = readString(raw.createdAt)
    ?? readString(raw.sentAt)
    ?? readString(raw.created_at)
    ?? '';

  return {
    id:          raw.id as string | number,
    projectId:   projectId as string | number | null | undefined,
    projectName: projectName ?? undefined,
    source:      readString(raw.source) ?? undefined,
    sender: sender ? {
      id:            readString(sender.id) ?? undefined,
      name:          senderName ?? undefined,
      avatarInitial: readString(sender.avatarInitial)
        ?? (senderName ? senderName.charAt(0).toUpperCase() : undefined),
    } : null,
    body:      readString(raw.body) ?? undefined,
    createdAt,
  };
}

export function normalizeMonitoredMessages(payload: unknown): ApiMonitoredMessage[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    .map(normalizeMonitoredMessage);
}
