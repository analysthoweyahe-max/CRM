export interface EmpParticipant {
  id:      string;
  name:    string;
  avatar?: string | null;
}

export interface EmpConversation {
  id:            string;
  name?:         string;
  last_message?: { body?: string; created_at?: string };
  unread_count?: number;
  participants?: EmpParticipant[];
  created_at?:   string;
}

export interface EmpAttachment {
  id?:   string;
  name:  string;
  url:   string;
  size?: number;
  type?: string;
}

export interface EmpMessage {
  id:           string;
  body:         string;
  sender:       EmpParticipant;
  created_at:   string;
  attachments?: EmpAttachment[];
}

/* ── Response envelopes ── */

export interface EmpConversationListResponse {
  status: string;
  data: {
    data:         EmpConversation[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
  };
}

export interface EmpConversationSingleResponse {
  status: string;
  data:   EmpConversation;
}

export interface EmpMessagesResponse {
  status: string;
  data: {
    data:         EmpMessage[];
    current_page: number;
    last_page:    number;
    total:        number;
    per_page:     number;
  };
}

export interface EmpSendMessageResponse {
  status: string;
  data:   EmpMessage;
}

export interface EmpConversationListParams {
  status?:   string;
  search?:   string;
  per_page?: number;
  page?:     number;
}

export interface EmpMessagesParams {
  per_page?: number;
  page?:     number;
}
