import {
  CLIENT_ISSUE_STATUS_COLORS,
  CLIENT_ISSUE_STATUS_KEYS,
} from '../constants/clientIssueStatuses';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import type {
  ClientIssue,
  ClientIssueCapabilities,
  ClientIssueListPayload,
  ClientIssueStatus,
  ProjectClientIssuePortal,
} from '../types/projectClientIssue.types';

/** Portals that can create/edit issues when the API omits `capabilities`. */
const WRITE_PORTALS: ProjectClientIssuePortal[] = [
  'pm-manager',
  'pm-employee',
  'seo-leader',
  'seo-member',
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readBool(...values: unknown[]): boolean | undefined {
  for (const v of values) {
    if (typeof v === 'boolean') return v;
    if (v === 1 || v === '1' || v === 'true') return true;
    if (v === 0 || v === '0' || v === 'false') return false;
  }
  return undefined;
}

/** Defaults when the list API omits `capabilities` or the request fails. */
export function defaultClientIssueCapabilities(
  portal: ProjectClientIssuePortal,
): ClientIssueCapabilities {
  const canWrite = WRITE_PORTALS.includes(portal);
  return {
    canView:         true,
    canCreate:       canWrite,
    canEdit:         canWrite,
    canDelete:       canWrite,
    canUpdateStatus: canWrite,
  };
}

function normalizeCapabilities(
  raw: unknown,
  portal: ProjectClientIssuePortal,
): ClientIssueCapabilities {
  const fallback = defaultClientIssueCapabilities(portal);
  const obj = asRecord(raw);

  // Missing / empty capabilities → portal write defaults (seo-member gets canCreate).
  if (!obj || Object.keys(obj).length === 0) {
    return fallback;
  }

  return {
    canView:         readBool(obj.canView, obj.can_view) ?? fallback.canView,
    canCreate:       readBool(obj.canCreate, obj.can_create) ?? fallback.canCreate,
    canEdit:         readBool(obj.canEdit, obj.can_edit) ?? fallback.canEdit,
    canDelete:       readBool(obj.canDelete, obj.can_delete) ?? fallback.canDelete,
    canUpdateStatus: readBool(obj.canUpdateStatus, obj.can_update_status) ?? fallback.canUpdateStatus,
  };
}

function normalizeIssue(raw: unknown): ClientIssue | null {
  const obj = asRecord(raw);
  if (!obj || obj.id == null) return null;

  const createdBy = asRecord(obj.createdBy) ?? asRecord(obj.created_by);

  return {
    id:              Number(obj.id),
    uuid:            typeof obj.uuid === 'string' ? obj.uuid : undefined,
    problem:         String(obj.problem ?? ''),
    impact:          String(obj.impact ?? ''),
    solution:        (obj.solution as string | null) ?? null,
    status:          (obj.status as ClientIssueStatus) ?? 'open_issues',
    statusLabel:     typeof obj.statusLabel === 'string'
      ? obj.statusLabel
      : typeof obj.status_label === 'string'
        ? obj.status_label
        : undefined,
    imageAttachment: (obj.imageAttachment ?? obj.image_attachment ?? null) as ClientIssue['imageAttachment'],
    fileAttachment:  (obj.fileAttachment ?? obj.file_attachment ?? null) as ClientIssue['fileAttachment'],
    createdBy: {
      id:   String(createdBy?.id ?? ''),
      name: String(createdBy?.name ?? ''),
    },
    createdAt: String(obj.createdAt ?? obj.created_at ?? ''),
    updatedAt: String(obj.updatedAt ?? obj.updated_at ?? ''),
    canEdit:          readBool(obj.canEdit, obj.can_edit),
    canDelete:        readBool(obj.canDelete, obj.can_delete),
    canUpdateStatus:  readBool(obj.canUpdateStatus, obj.can_update_status),
  };
}

/**
 * Normalizes list payloads from several possible backend shapes:
 * - `{ data: Issue[], capabilities: {...} }`
 * - `{ data: Issue[] }` (capabilities missing)
 * - `Issue[]` directly
 * - nested `{ data: { data: Issue[], capabilities } }`
 * - snake_case capability keys (`can_create`, etc.)
 * - top-level `capabilities` on the API envelope
 */
export function normalizeClientIssueList(
  payload: unknown,
  portal: ProjectClientIssuePortal,
  envelopeCapabilities?: unknown,
): ClientIssueListPayload {
  if (Array.isArray(payload)) {
    return {
      data: payload.map(normalizeIssue).filter((i): i is ClientIssue => !!i),
      capabilities: normalizeCapabilities(envelopeCapabilities ?? null, portal),
    };
  }

  const obj = asRecord(payload);
  if (!obj) {
    return { data: [], capabilities: normalizeCapabilities(envelopeCapabilities ?? null, portal) };
  }

  // Nested: { data: { data: [...], capabilities } }
  const nested = asRecord(obj.data);
  const listSource =
    Array.isArray(obj.data) ? obj.data
    : Array.isArray(obj.issues) ? obj.issues
    : Array.isArray(nested?.data) ? nested!.data
    : Array.isArray(nested?.issues) ? nested!.issues
    : [];

  const capsRaw =
    obj.capabilities
    ?? obj.meta
    ?? nested?.capabilities
    ?? nested?.meta
    ?? envelopeCapabilities
    ?? null;

  return {
    data: listSource.map(normalizeIssue).filter((i): i is ClientIssue => !!i),
    capabilities: normalizeCapabilities(capsRaw, portal),
  };
}

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
