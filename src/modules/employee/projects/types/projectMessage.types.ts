export interface ChatMessage {
  id:            string;
  senderName:    string;
  senderInitial: string;
  senderColor:   string;
  text:          string;
  time:          string;
  isOwn:         boolean;
  isRead:        boolean;
}

/* ── Raw backend shapes — /v1/pm/employee/projects/{project_id}/messages ─── */
export interface PmMessageSender {
  id:            string;
  name:          string;
  type:          string;
  avatarUrl:     string | null;
  avatarInitial: string;
}

export interface PmMessageAttachment {
  id:   number;
  name?: string;
  url?:  string;
}

export interface PmMessage {
  id:          number;
  body:        string;
  type:        string;
  sender:      PmMessageSender;
  attachments: PmMessageAttachment[];
  createdAt:   string;
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
  data: {
    data: PmMentionable[];
  };
}
