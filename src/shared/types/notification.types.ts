export interface AppNotification {
  id:        string;
  type:      string;
  title:     string;
  body:      string;
  data?:     Record<string, unknown> | string;
  readAt:    string | null;
  createdAt: string;
}
