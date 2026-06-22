export type NotificationType = 'leave' | 'message' | 'general';

export interface AppNotification {
  id:      string;
  type:    NotificationType;
  titleAr: string;
  titleEn: string;
  bodyAr:  string;
  bodyEn:  string;
  time:    string;
  read:    boolean;
}
