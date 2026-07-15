import type { MentionRef } from '@/shared/components/chat';

export type TaskModalTab = 'info' | 'time' | 'attachments' | 'comments';

export interface TimeSession {
  id:    string;
  date:  string;
  from:  string;
  to:    string;
  hours: number;
}

export interface TaskAttachment {
  id:         string;
  name:       string;
  sizeLabel:  string;
  uploadedBy: string;
  uploadedAt: string;
  fileType:   'image' | 'pdf' | 'other';
  file?:      File;
  url?:       string;
}

export interface TaskComment {
  id:            string;
  author:        string;
  authorInitial: string;
  authorColor:   string;
  text:          string;
  dateLabel:     string;
  isMine?:       boolean;
  mentions?:     MentionRef[];
  isEdited?:     boolean;
  editedAt?:     string | null;
  /** Nested replies (one level from API). */
  replies?:      TaskComment[];
}
