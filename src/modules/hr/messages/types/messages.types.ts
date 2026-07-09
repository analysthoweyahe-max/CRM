/* ── REST API types ─────────────────────────────────────────── */

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
  participants?:      ApiParticipant[];
  employeeName?:      string;
  employeeNumber?:    string;
  subject?:           string;
  lastMessage?:       string;
  last_message?:      { body?: string; created_at?: string };
  lastUpdatedAt?:     string;
  unread_count?:      number;
  hasUnread?:         boolean;
  status?:            string;
  created_at?:        string;
}

export interface ApiEmployeeLookup {
  id:               string;
  name:             string;
  employee_number?: string;
  department?:      string;
}

export interface ApiMessageAttachment {
  type:  string;
  url:   string;
  name?: string;
  size?: number;
}

export interface ApiMessage {
  id:              string | number;
  conversationId?: string;
  body?:           string;
  created_at?:     string;
  sentAt?:         string;
  read_at?:        string | null;
  senderName?:     string;
  senderType?:     string;
  type?:           string;
  isMine?:         boolean;
  sender?:         ApiParticipant;
  attachments?:    ApiMessageAttachment[];
}

/* ── Response envelopes ─────────────────────────────────────── */
export interface ConversationListResponse {
  status: string;
  data: { data: ApiConversation[]; current_page: number; last_page: number; total: number; per_page: number; };
}
export interface ConversationSingleResponse { status: string; data: ApiConversation; }
export interface EmployeeLookupResponse     { status: string; data: ApiEmployeeLookup[]; }
export interface MessagesListResponse {
  status: string;
  data: { data: ApiMessage[]; current_page: number; last_page: number; total: number; per_page: number; };
}
export interface SendMessageResponse { status: string; data: ApiMessage; }
