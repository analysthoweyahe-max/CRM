/** FCM / Echo payload types for realtime chat (docs Realtime Messages). */
export const REALTIME_MESSAGE_TYPES = [
  'seo_direct_message',
  'seo_direct_message_updated',
  'seo_project_message',
  'seo_client_update',
  'pm_project_message',
  'pm_client_update',
  'hr_message',
] as const;

/**
 * Types that may be chat bubbles when Echo delivers `.message.sent`.
 * Request/alert types that share the same channel must NOT land here.
 */
export const CHAT_BUBBLE_TYPES = [
  'seo_direct_message',
  'seo_project_message',
  'pm_project_message',
  'hr_message',
  'pm_client_update',
  'seo_client_update',
] as const;

/** Requests / alerts — toast/notification center only, never chat bubbles. */
export const NOTIFICATION_ONLY_TYPES = [
  'hr_leave_submitted',
  'hr_leave_status_updated',
  'hr_attendance_exception_submitted',
  'hr_attendance_exception_status_updated',
  'pm_request_submitted',
  'pm_request_reviewed',
  'seo_request_submitted',
  'seo_request_reviewed',
  'instruction',
] as const;

/** Echo `.message.updated` / FCM edit events — patch existing bubbles, no toast. */
export const REALTIME_MESSAGE_UPDATED_TYPES = [
  'seo_direct_message_updated',
] as const;

export type RealtimeMessageUpdatedType = (typeof REALTIME_MESSAGE_UPDATED_TYPES)[number];

export function isRealtimeMessageUpdatedType(
  type: string | undefined | null,
): type is RealtimeMessageUpdatedType {
  return !!type && (REALTIME_MESSAGE_UPDATED_TYPES as readonly string[]).includes(type);
}

export type RealtimeMessageType = (typeof REALTIME_MESSAGE_TYPES)[number];
export type ChatBubbleType = (typeof CHAT_BUBBLE_TYPES)[number];

export interface RealtimeMessageSender {
  id?:   string;
  name?: string;
  type?: 'admin' | 'employee' | string;
}

export interface RealtimeMessagePayload {
  type?:             string;
  /** Toast / badge only — never use as chat bubble text. */
  title?:            string;
  /** Toast / badge body; may duplicate notification copy. Prefer messageBody for bubbles. */
  body?:             string;
  /** Actual chat message text from Echo `.message.sent`. */
  messageBody?:      string;
  message_body?:     string;
  preview?:          string;
  conversationId?:   string;
  conversationType?: string;
  conversationName?: string;
  projectId?:        string;
  projectName?:      string;
  phaseId?:          string;
  messageId?:        string;
  messageType?:      string;
  isMine?:           boolean;
  echoToSender?:     boolean;
  sender?:           RealtimeMessageSender | string;
  [key: string]:     unknown;
}

export function isRealtimeMessageType(type: string | undefined | null): type is RealtimeMessageType {
  return !!type && (REALTIME_MESSAGE_TYPES as readonly string[]).includes(type);
}

export function isChatBubbleType(type: string | undefined | null): type is ChatBubbleType {
  return !!type && (CHAT_BUBBLE_TYPES as readonly string[]).includes(type);
}

export function isNotificationOnlyType(type: string | undefined | null): boolean {
  return !!type && (NOTIFICATION_ONLY_TYPES as readonly string[]).includes(type);
}
