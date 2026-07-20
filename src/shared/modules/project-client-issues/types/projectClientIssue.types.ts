export type ClientIssueStatus =
  | 'open_issues'
  | 'sent_to_client'
  | 'under_review'
  | 'resolved'
  | 'rejected';

export type ProjectClientIssuePortal =
  | 'pm-manager'
  | 'pm-employee'
  | 'seo-leader'
  | 'seo-member';

/** @deprecated Use ProjectClientIssuePortal */
export type ProjectClientIssueScope = ProjectClientIssuePortal;

export interface ClientIssueAttachment {
  id:       number;
  name:     string;
  url:      string;
  mimeType?: string;
  type:     'image' | 'file';
}

export interface ClientIssueUser {
  id:   string;
  name: string;
}

export interface ClientIssue {
  id:              number;
  uuid?:           string;
  problem:         string;
  impact:          string;
  solution:        string | null;
  status:          ClientIssueStatus;
  statusLabel?:    string;
  imageAttachment: ClientIssueAttachment | null;
  fileAttachment:  ClientIssueAttachment | null;
  createdBy:       ClientIssueUser;
  createdAt:       string;
  updatedAt:       string;
  canEdit?:        boolean;
  canDelete?:      boolean;
  canUpdateStatus?: boolean;
}

export interface ClientIssueCapabilities {
  canView:         boolean;
  canCreate:       boolean;
  canEdit:         boolean;
  canDelete:       boolean;
  canUpdateStatus: boolean;
}

export interface ClientIssueListPayload {
  data:         ClientIssue[];
  capabilities: ClientIssueCapabilities;
}

export interface ClientIssueListApiResponse {
  status:  string;
  message: string;
  data:    ClientIssueListPayload;
}

export interface ClientIssueApiResponse {
  status:  string;
  message: string;
  data:    ClientIssue;
}

export interface CreateClientIssuePayload {
  problem:  string;
  impact:   string;
  solution?: string | null;
  status?:  ClientIssueStatus;
}

export interface UpdateClientIssuePayload {
  problem?:  string;
  impact?:   string;
  solution?: string | null;
}

export interface UpdateClientIssueStatusPayload {
  status: ClientIssueStatus;
}
