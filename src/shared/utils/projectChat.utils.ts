import { getAvatarColor } from '@/shared/utils';

export interface ProjectChatAttachment {
  id:       number;
  fileName: string;
  mimeType: string;
  size:     number;
  url:      string;
}

export interface ProjectChatMessage {
  id:            string;
  senderName:    string;
  senderInitial: string;
  senderColor:   string;
  text:          string;
  time:          string;
  isOwn:         boolean;
  isRead:        boolean;
  messageType:   string;
  attachments:   ProjectChatAttachment[];
}

export interface RawProjectMessage {
  id:          number;
  body:        string;
  type:        string;
  isMine?:     boolean;
  sender:      { id: string; name: string; avatarInitial: string };
  attachments: Array<{
    id:       number;
    fileName?: string;
    name?:    string;
    mimeType?: string;
    size?:    number;
    url?:     string;
  }>;
  createdAt?:  string;
  sentAt?:    string;
  sentTime?:  string;
}

export function mapProjectMessage(m: RawProjectMessage, currentUserId?: string): ProjectChatMessage {
  const time = m.sentTime
    ?? m.sentAt?.split(' ')[1]?.slice(0, 5)
    ?? m.createdAt?.split(' ')[1]?.slice(0, 5)
    ?? '';

  return {
    id:            String(m.id),
    senderName:    m.sender.name,
    senderInitial: m.sender.avatarInitial,
    senderColor:   getAvatarColor(m.sender.name),
    text:          m.body ?? '',
    time,
    isOwn:         m.isMine ?? (!!currentUserId && m.sender.id === currentUserId),
    isRead:        true,
    messageType:   m.type,
    attachments:   (m.attachments ?? []).map(a => ({
      id:       a.id,
      fileName: a.fileName ?? a.name ?? 'file',
      mimeType: a.mimeType ?? 'application/octet-stream',
      size:     a.size ?? 0,
      url:      a.url ?? '',
    })),
  };
}

export function buildProjectMessageForm(payload: { body?: string; file?: File }): FormData | { body: string } {
  if (payload.file) {
    const fd = new FormData();
    if (payload.body?.trim()) fd.append('body', payload.body.trim());
    fd.append('file', payload.file);
    return fd;
  }
  return { body: payload.body?.trim() ?? '' };
}
