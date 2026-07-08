export interface ApiMonitoredMessageSender {
  id?:            string | null;
  name?:          string | null;
  avatarInitial?: string | null;
}

export interface ApiMonitoredMessage {
  id:          string | number;
  projectId?:   string | number | null;
  projectName?: string | null;
  source?:      string | null;
  sender?:      ApiMonitoredMessageSender | null;
  body?:        string | null;
  createdAt:   string;
}

export interface MonitoredMessageListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiMonitoredMessage[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface MessagesMonitorFilters {
  project_id?: string | number;
  source?:     string;
  search?:     string;
  per_page?:   number;
  page?:       number;
}
