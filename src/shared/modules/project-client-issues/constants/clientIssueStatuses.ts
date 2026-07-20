import type { ClientIssueStatus } from '../types/projectClientIssue.types';

/** Fixed column order — localized fallbacks via `translateProjectLookup`. */
export const CLIENT_ISSUE_STATUS_KEYS: ClientIssueStatus[] = [
  'open_issues',
  'sent_to_client',
  'under_review',
  'resolved',
  'rejected',
];

export const CLIENT_ISSUE_STATUS_COLORS: Record<ClientIssueStatus, string> = {
  open_issues:    '#F43F5E',
  sent_to_client: '#38BDF8',
  under_review:   '#F59E0B',
  resolved:       '#A0CD39',
  rejected:       '#9CA3AF',
};
