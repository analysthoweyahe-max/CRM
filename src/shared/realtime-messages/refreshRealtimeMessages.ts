import type { QueryClient } from '@tanstack/react-query';
import type { RealtimeMessagePayload, RealtimeMessageType } from './messageRealtime.types';
import { isRealtimeMessageType } from './messageRealtime.types';

function readId(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'string' || typeof value === 'number') return String(value);
  }
  return undefined;
}

/** Normalize FCM data (nested objects arrive as JSON strings). */
export function parseRealtimeMessagePayload(
  raw: Record<string, unknown> | RealtimeMessagePayload | null | undefined,
): RealtimeMessagePayload {
  if (!raw || typeof raw !== 'object') return {};

  const out: RealtimeMessagePayload = { ...raw };

  if (typeof out.sender === 'string') {
    try {
      out.sender = JSON.parse(out.sender) as RealtimeMessagePayload['sender'];
    } catch {
      /* keep string */
    }
  }

  out.conversationId = readId(out.conversationId, out.conversation_id);
  out.projectId = readId(out.projectId, out.project_id);
  out.phaseId = readId(out.phaseId, out.phase_id);
  out.messageId = readId(out.messageId, out.message_id, out.id);

  // Normalize edit fields for `.message.updated`
  const editedAt = readId(out.editedAt, out.edited_at);
  if (editedAt) out.editedAt = editedAt;
  if (out.is_edited != null && out.isEdited == null) out.isEdited = out.is_edited;

  return out;
}

function hasActiveQuery(qc: QueryClient, queryKey: readonly unknown[]): boolean {
  return qc.getQueryCache().findAll({ queryKey, type: 'active' }).length > 0;
}

/** True when the matching chat thread/list query is currently mounted. */
export function isRealtimeChatOpen(qc: QueryClient, payload: RealtimeMessagePayload): boolean {
  const type = payload.type;
  if (!isRealtimeMessageType(type)) return false;

  const conversationId = payload.conversationId;
  const projectId = payload.projectId;
  const phaseId = payload.phaseId;

  switch (type) {
    case 'hr_message':
      if (!conversationId) {
        return hasActiveQuery(qc, ['hr', 'messages'])
          || hasActiveQuery(qc, ['employee', 'messages']);
      }
      return hasActiveQuery(qc, ['hr', 'messages', 'thread', conversationId])
        || hasActiveQuery(qc, ['employee', 'messages', 'messages', conversationId]);

    case 'seo_direct_message':
      if (!conversationId) return hasActiveQuery(qc, ['seo-member', 'messages']);
      return hasActiveQuery(qc, ['seo-member', 'messages', 'messages', conversationId]);

    case 'seo_project_message':
      if (!projectId) return hasActiveQuery(qc, ['seo-messages']);
      return hasActiveQuery(qc, ['seo-messages', projectId]);

    case 'pm_project_message':
      if (!projectId) {
        return hasActiveQuery(qc, ['pm-project-messages'])
          || hasActiveQuery(qc, ['emp-project-messages']);
      }
      return hasActiveQuery(qc, ['pm-project-messages', projectId])
        || hasActiveQuery(qc, ['emp-project-messages', projectId]);

    case 'pm_client_update':
      if (!projectId) return hasActiveQuery(qc, ['pm-phase-messages']);
      if (phaseId) return hasActiveQuery(qc, ['pm-phase-messages', projectId, phaseId]);
      return hasActiveQuery(qc, ['pm-phase-messages', projectId])
        || hasActiveQuery(qc, ['pm-client-updates', projectId]);

    case 'seo_client_update':
      if (!projectId) return false;
      return hasActiveQuery(qc, ['seo-client-updates', projectId])
        || hasActiveQuery(qc, ['seo-phase-messages', projectId]);

    default:
      return false;
  }
}

/** Invalidate conversation lists + open thread queries for a realtime message event. */
export function refreshRealtimeMessages(qc: QueryClient, payload: RealtimeMessagePayload): void {
  const type = payload.type as RealtimeMessageType | undefined;
  if (!type || !isRealtimeMessageType(type)) return;

  const conversationId = payload.conversationId;
  const projectId = payload.projectId;
  const phaseId = payload.phaseId;

  switch (type) {
    case 'hr_message':
      qc.invalidateQueries({ queryKey: ['hr', 'messages'] });
      qc.invalidateQueries({ queryKey: ['employee', 'messages'] });
      qc.invalidateQueries({ queryKey: ['admin', 'messages-monitor'] });
      if (conversationId) {
        qc.invalidateQueries({ queryKey: ['hr', 'messages', 'thread', conversationId] });
        qc.invalidateQueries({ queryKey: ['employee', 'messages', 'messages', conversationId] });
      }
      break;

    case 'seo_direct_message':
      qc.invalidateQueries({ queryKey: ['seo-member', 'messages'] });
      qc.invalidateQueries({ queryKey: ['admin', 'messages-monitor'] });
      if (conversationId) {
        qc.invalidateQueries({ queryKey: ['seo-member', 'messages', 'messages', conversationId] });
        qc.invalidateQueries({ queryKey: ['seo-member', 'messages', 'conversation', conversationId] });
      }
      break;

    case 'seo_project_message':
      qc.invalidateQueries({ queryKey: ['seo-messages'] });
      if (projectId) qc.invalidateQueries({ queryKey: ['seo-messages', projectId] });
      qc.invalidateQueries({ queryKey: ['admin', 'messages-monitor'] });
      break;

    case 'pm_project_message':
      qc.invalidateQueries({ queryKey: ['pm-project-messages'] });
      qc.invalidateQueries({ queryKey: ['emp-project-messages'] });
      qc.invalidateQueries({ queryKey: ['pm-messages-projects'] });
      if (projectId) {
        qc.invalidateQueries({ queryKey: ['pm-project-messages', projectId] });
        qc.invalidateQueries({ queryKey: ['emp-project-messages', projectId] });
      }
      qc.invalidateQueries({ queryKey: ['admin', 'messages-monitor'] });
      break;

    case 'pm_client_update':
      qc.invalidateQueries({ queryKey: ['pm-client-updates'] });
      qc.invalidateQueries({ queryKey: ['pm-phase-messages'] });
      qc.invalidateQueries({ queryKey: ['admin', 'messages-monitor'] });
      if (projectId) {
        qc.invalidateQueries({ queryKey: ['pm-client-updates', projectId] });
        if (phaseId) {
          qc.invalidateQueries({ queryKey: ['pm-phase-messages', projectId, phaseId] });
        } else {
          qc.invalidateQueries({ queryKey: ['pm-phase-messages', projectId] });
        }
      }
      break;

    case 'seo_client_update':
      qc.invalidateQueries({ queryKey: ['seo-client-updates'] });
      qc.invalidateQueries({ queryKey: ['seo-phase-messages'] });
      if (projectId) {
        qc.invalidateQueries({ queryKey: ['seo-client-updates', projectId] });
        if (phaseId) {
          qc.invalidateQueries({ queryKey: ['seo-phase-messages', projectId, phaseId] });
        } else {
          qc.invalidateQueries({ queryKey: ['seo-phase-messages', projectId] });
        }
      }
      break;
  }
}
