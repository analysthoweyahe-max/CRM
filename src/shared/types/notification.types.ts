export interface AppNotification {
  id:        string;
  type:      string;
  title:     string;
  body:      string;
  data?:     Record<string, unknown>;
  readAt:    string | null;
  createdAt: string;
}
