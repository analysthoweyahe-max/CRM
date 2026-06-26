// Stream SDK type re-export (used by ChatWindow & ConversationList)
export type { Channel as StreamChannel } from 'stream-chat';

/* ── REST API types ─────────────────────────────────────────── */

// GET /chat/token
export interface ChatTokenResponse {
  token:   string;
  api_key: string;
  user_id: string;
}

export interface ApiParticipant {
  id:               string;
  name:             string;
  employee_number?: string;
  avatar?:          string;
  department?:      string;
}

export interface ApiConversation {
  id:                 string;
  stream_channel_id?: string;
  participants:       ApiParticipant[];
  last_message?:      { body?: string; created_at?: string };
  unread_count?:      number;
  status?:            string;
  created_at:         string;
}

export interface ApiEmployeeLookup {
  id:               string;
  name:             string;
  employee_number?: string;
  department?:      string;
}

/* ── Response envelopes ─────────────────────────────────────── */
export interface ConversationListResponse {
  status: string;
  data: { data: ApiConversation[]; current_page: number; last_page: number; total: number; per_page: number; };
}
export interface ConversationSingleResponse { status: string; data: ApiConversation; }
export interface EmployeeLookupResponse     { status: string; data: ApiEmployeeLookup[]; }
