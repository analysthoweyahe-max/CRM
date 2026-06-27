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
