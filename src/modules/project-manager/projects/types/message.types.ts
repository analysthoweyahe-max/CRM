export interface ChatMessage {
  id:            string;
  senderName:    string;
  senderInitial: string;
  senderColor:   string;
  text:          string;
  time:          string;
  isOwn:         boolean;
  isRead:        boolean;
  messageType?:  string;
  attachments?:  Array<{ id: number; fileName: string; mimeType: string; size: number; url: string }>;
}

/* ── Raw backend shapes — /v1/pm/projects/{project_id}/messages ─────────── */
export interface PmMessageSender {
  id:            string;
  name:          string;
  type:          string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface PmMessageAttachment {
  id:       number;
  fileName?: string;
  name?:    string;
  mimeType?: string;
  size?:    number;
  url?:     string;
}

export interface PmMessage {
  id:          number;
  body:        string;
  type:        string;
  isMine?:     boolean;
  sender:      PmMessageSender;
  attachments: PmMessageAttachment[];
  createdAt?:  string;
  sentAt?:     string;
  sentTime?:   string;
}

export interface PmMessageListResponse {
  status:  string;
  message: string;
  data: {
    data:         PmMessage[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface PmMessageSendResponse {
  status:  string;
  message: string;
  data:    PmMessage;
}

export interface PmMentionable {
  id:            string;
  name:          string;
  type:          string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface PmMentionablesResponse {
  status:  string;
  message: string;
  /** Flat array or paginated `{ data: [...] }` — normalize with `toApiArray`. */
  data:    PmMentionable[] | { data: PmMentionable[] };
}
