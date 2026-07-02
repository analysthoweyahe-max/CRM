export interface PmClientAttachment {
  id:   number;
  name?: string;
  url?:  string;
}

export interface PmClientMessageSender {
  id:   string;
  name: string;
  type: string;
}

export interface PmClientMessage {
  id:          number;
  body:        string;
  type:        string;
  sender:      PmClientMessageSender;
  attachments: PmClientAttachment[];
  createdAt:   string;
}

export interface PmClientUpdatePhase {
  id:                  number;
  uuid:                string;
  name:                string;
  description:         string;
  deliveryDate:        string | null;
  approvalStatus:      string;
  approvalStatusLabel: string;
  clientApprovedAt:    string | null;
  sortOrder:           number;
  tasksCount:          number;
  attachments:         PmClientAttachment[];
  clientMessages:      PmClientMessage[];
}

export interface PmClientUpdatesApiResponse {
  status:  string;
  message: string;
  data: {
    data:  PmClientUpdatePhase[];
    total: number;
  };
}

export interface PmPhaseMessagesApiResponse {
  status:  string;
  message: string;
  data: {
    data:         PmClientMessage[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface PmSendMessageApiResponse {
  status:  string;
  message: string;
  data:    PmClientMessage;
}
