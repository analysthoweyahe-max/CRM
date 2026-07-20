import {
  CLIENT_ISSUE_STATUS_COLORS,
  CLIENT_ISSUE_STATUS_KEYS,
} from '../constants/clientIssueStatuses';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import type { ClientIssue, ClientIssueStatus } from '../types/projectClientIssue.types';

/** API-provided labels from list items, keyed by status slug. */
export function buildStatusLabelMap(issues: ClientIssue[]): Map<ClientIssueStatus, string> {
  const map = new Map<ClientIssueStatus, string>();
  for (const issue of issues) {
    if (issue.statusLabel) map.set(issue.status, issue.statusLabel);
  }
  return map;
}

export function statusLabelFor(
  key: ClientIssueStatus,
  labelMap: Map<ClientIssueStatus, string>,
  isAr: boolean,
): string {
  const apiLabel = labelMap.get(key);
  const fallbackEn = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return translateProjectLookup(key, apiLabel ?? fallbackEn, isAr);
}

export function buildClientIssueColumns(issues: ClientIssue[], isAr: boolean) {
  const labelMap = buildStatusLabelMap(issues);
  return CLIENT_ISSUE_STATUS_KEYS.map(key => ({
    key,
    label: statusLabelFor(key, labelMap, isAr),
    color: CLIENT_ISSUE_STATUS_COLORS[key],
    items: issues.filter(i => i.status === key),
  }));
}

export function buildStatusComboboxItems(
  labelMap: Map<ClientIssueStatus, string>,
  isAr: boolean,
) {
  return CLIENT_ISSUE_STATUS_KEYS.map(key => ({
    id:    key,
    label: statusLabelFor(key, labelMap, isAr),
  }));
}

export function clientIssueResourceKey(issue: Pick<ClientIssue, 'id' | 'uuid'>): string | number {
  return issue.uuid ?? issue.id;
}
