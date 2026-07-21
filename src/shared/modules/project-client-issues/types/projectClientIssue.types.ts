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

/**
 * Client issue model aligned with the API contract.
 * Attachments and links are always arrays after normalization.
 * Legacy singular attachment fields are accepted only as a fallback in the normalizer.
 */
export interface ClientIssue {
  id:               number;
  uuid?:            string;
  problem:          string;
  impact:           string;
  solution:         string | null;
  status:           ClientIssueStatus;
  statusLabel?:     string;
  imageAttachments: ClientIssueAttachment[];
  fileAttachments:  ClientIssueAttachment[];
  links:            string[];
  createdBy:        ClientIssueUser;
  createdAt:        string;
  updatedAt:        string;
  canEdit?:         boolean;
  canDelete?:       boolean;
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
  /** Optional. Absolute http(s) URLs only. Send [] for none. */
  links?:   string[];
}

export interface UpdateClientIssuePayload {
  problem?:  string;
  impact?:   string;
  solution?: string | null;
  /**
   * Optional. When sent, replaces the full links list.
   * Omit to leave existing links unchanged. Send [] to clear.
   */
  links?:    string[];
}

export interface UpdateClientIssueStatusPayload {
  status: ClientIssueStatus;
}
