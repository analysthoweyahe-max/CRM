/** FCM / Echo payload types for realtime chat (docs Realtime Messages). */
export const REALTIME_MESSAGE_TYPES = [
  'seo_direct_message',
  'seo_project_message',
  'seo_client_update',
  'pm_project_message',
  'pm_client_update',
  'hr_message',
] as const;

export type RealtimeMessageType = (typeof REALTIME_MESSAGE_TYPES)[number];

export interface RealtimeMessageSender {
  id?:   string;
  name?: string;
  type?: 'admin' | 'employee' | string;
}

export interface RealtimeMessagePayload {
  type?:             string;
  title?:            string;
  body?:             string;
  conversationId?:   string;
  conversationType?: string;
  conversationName?: string;
  projectId?:        string;
  projectName?:      string;
  phaseId?:          string;
  messageId?:        string;
  sender?:           RealtimeMessageSender | string;
  [key: string]:     unknown;
}

export function isRealtimeMessageType(type: string | undefined | null): type is RealtimeMessageType {
  return !!type && (REALTIME_MESSAGE_TYPES as readonly string[]).includes(type);
}
