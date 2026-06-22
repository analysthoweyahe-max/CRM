import 'stream-chat';

declare module 'stream-chat' {
  interface CustomChannelData {
    recipient_name?: string;
    recipient_id?:   string;
  }
}
