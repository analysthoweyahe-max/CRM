export interface SeoConversation {
  id:            string;
  name?:         string;
  last_message?: { body?: string; created_at?: string };
  unread_count?: number;
}

export interface SeoConversationListResponse {
  status:  string;
  message: string;
  data: {
    data:         SeoConversation[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface SeoMessageSender {
  id:             string;
  name:           string;
  type?:          string;
  avatarUrl?:     string | null;
  avatarInitial?: string;
}

export interface SeoMessageAttachment {
  id:         number;
  fileName?:  string;
  name?:      string;
  mimeType?:  string;
  size?:      number;
  url?:       string;
}

/* Backend has been consistent elsewhere with {sender, isMine, sentAt, sentTime}
 * for /v1/seo/* message endpoints — but this specific conversation-messages
 * response was never confirmed with a live sample, so every field here is
 * treated as optional and mapped defensively (see toChatMessage in the hook). */
export interface SeoMessage {
  id:          number | string;
  body:        string | null;
  type?:       string;
  sender:      SeoMessageSender;
  isMine?:     boolean;
  attachments?: SeoMessageAttachment[];
  sentAt?:     string;
  sentTime?:   string;
  created_at?: string;
}

export interface SeoMessageListResponse {
  status:  string;
  message: string;
  data: {
    data:         SeoMessage[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface SeoMessageSendResponse {
  status:  string;
  message: string;
  data:    SeoMessage;
}

export interface SeoMentionable {
  id:            string;
  name:          string;
  type?:         string;
  avatarUrl?:    string | null;
  avatarInitial?: string;
}

export interface SeoMentionablesResponse {
  status:  string;
  message: string;
  data: {
    data:  SeoMentionable[];
    total?: number;
  };
}

export interface CreateSeoConversationPayload {
  recipient_type: string;
  recipient_id:   string;
  message:        string;
}
