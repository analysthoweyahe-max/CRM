export interface ApiMonitoredMessageSender {
  id?:            string | null;
  name?:          string | null;
  type?:          string | null;
  avatarInitial?: string | null;
}

export interface ApiMonitoredMessage {
  id:          string | number;
  conversationId?: string | null;
  conversationName?: string | null;
  source?:      string | null;
  sender?:      ApiMonitoredMessageSender | null;
  body?:        string | null;
  createdAt:   string;
}

export interface MonitoredParty {
  id?:   string | null;
  name:  string;
  type?: 'admin' | 'employee' | string | null;
}

export interface MonitoredConversation {
  id:           string;
  type:         'direct' | 'group' | string;
  name:         string;
  /** Participants from API — always shown (including when isObserver). */
  parties:      MonitoredParty[];
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  /** Super-admin may be observer on chats they are not a member of. */
  isObserver:   boolean;
  unreadCount:  number;
  source:       'messenger';
}

export interface MessengerConversationListResponse {
  status:  string;
  message?: string;
  data: {
    data:         unknown[];
    current_page?: number;
    last_page?:    number;
    total?:        number;
  };
}

export interface MessengerMessageListResponse {
  status:  string;
  message?: string;
  data: {
    data:         unknown[];
    current_page?: number;
    last_page?:    number;
    total?:        number;
  };
}
