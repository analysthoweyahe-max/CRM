export type SeoConversationType = 'direct' | 'group';
export type SeoParticipantType = 'employee' | 'admin';

export interface SeoParticipant {
  id:             string;
  name:           string;
  type:           SeoParticipantType;
  role?:          string | null;
  roleLabel?:     string | null;
  isManager?:     boolean;
  avatarUrl?:     string | null;
  avatarInitial?: string;
}

export interface SeoConversation {
  id:                string;
  type:              SeoConversationType;
  name?:             string | null;
  lastMessage?:      string | null;
  lastMessageAt?:    string | null;
  unreadCount?:      number;
  participantCount?: number;
  /** Other party for direct chats */
  participant?:      SeoParticipant | null;
  /** Members for group chats */
  participants?:     SeoParticipant[] | null;
  /** Only group managers may add/remove members or assign new managers. */
  canManageMembers?: boolean;
  /** Super-admin may open chats in read-only observer mode. */
  isObserver?: boolean;
  /** When provided by the API, overrides client-side send rules. */
  canSend?: boolean;
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

export interface SeoConversationSingleResponse {
  status:  string;
  message: string;
  data:    SeoConversation;
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
  type?:      string;
  size?:      number;
  url?:       string;
}

export interface SeoMessageReaction {
  emoji:  string;
  count?: number;
  reactedByMe?: boolean;
  users?: Array<{ id?: string; name?: string }>;
}

export type SeoMessageType = 'text' | 'image' | 'file' | 'voice' | string;

export interface SeoMessageReplyPreview {
  id:               number | string;
  body?:            string | null;
  type?:            SeoMessageType;
  durationSeconds?: number | null;
  sender?: {
    id?:   string;
    name?: string;
    type?: string;
  };
}

export interface SeoMessage {
  id:               number | string;
  body:             string | null;
  type?:            SeoMessageType;
  durationSeconds?: number | null;
  duration_seconds?: number | null;
  sender:           SeoMessageSender;
  isMine?:          boolean;
  attachments?:     SeoMessageAttachment[];
  sentAt?:          string;
  sentTime?:        string;
  created_at?:      string;
  editedAt?:        string | null;
  edited_at?:       string | null;
  isEdited?:        boolean;
  /** Quoted parent when this message is a reply */
  replyTo?:         SeoMessageReplyPreview | null;
  reply_to?:        SeoMessageReplyPreview | null;
  reactions?:       SeoMessageReaction[];
  mentions?:        SeoMentionRef[];
}

export interface SeoMentionRef {
  type: SeoParticipantType;
  id:   string;
}

export interface SendSeoMessagePayload {
  body?:              string;
  reply_to?:          number | string;
  file?:              File;
  duration_seconds?:  number;
  mentions?:          SeoMentionRef[];
}

export interface UpdateSeoMessagePayload {
  body:     string;
  mentions?: SeoMentionRef[];
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
  id:             string;
  name:           string;
  type:           SeoParticipantType;
  role?:          string | null;
  department?:    string | null;
  avatarUrl?:     string | null;
  avatarInitial?: string;
}

export interface SeoMentionablesResponse {
  status:  string;
  message: string;
  data: {
    data:   SeoMentionable[];
    total?: number;
  };
}

export interface SeoGroupMemberRef {
  type: SeoParticipantType;
  id:   string;
}

export interface CreateSeoConversationPayload {
  recipient_type: string;
  recipient_id:   string;
  message?:       string;
}

export interface CreateSeoGroupPayload {
  name:     string;
  members:  SeoGroupMemberRef[];
  message?: string;
}

export interface ManageSeoGroupMembersPayload {
  members: SeoGroupMemberRef[];
}

export interface SeoConversationListParams {
  search?:   string;
  type?:     SeoConversationType;
  per_page?: number;
}
