import {
  CLIENT_ISSUE_STATUS_COLORS,
  CLIENT_ISSUE_STATUS_KEYS,
} from '../constants/clientIssueStatuses';
import { normalizeImportantLinks } from '@/shared/utils/importantLinks.utils';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import type {
  ClientIssue,
  ClientIssueAttachment,
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

function normalizeAttachment(
  raw: unknown,
  fallbackType: 'image' | 'file',
): ClientIssueAttachment | null {
  const obj = asRecord(raw);
  if (!obj || obj.id == null) return null;
  const url = String(obj.url ?? '');
  if (!url) return null;
  const typeRaw = obj.type;
  const type: 'image' | 'file' =
    typeRaw === 'image' || typeRaw === 'file' ? typeRaw : fallbackType;
  return {
    id:       Number(obj.id),
    name:     String(obj.name ?? obj.file_name ?? obj.fileName ?? 'attachment'),
    url,
    mimeType: typeof obj.mimeType === 'string'
      ? obj.mimeType
      : typeof obj.mime_type === 'string'
        ? obj.mime_type
        : undefined,
    type,
  };
}

/**
 * Prefer plural array when present (including empty `[]`).
 * Fallback only when plural is missing: singular ? [singular] : []
 * Matches: imageAttachments ?? (imageAttachment ? [imageAttachment] : [])
 */
function normalizeAttachments(
  plural: unknown,
  singular: unknown,
  fallbackType: 'image' | 'file',
): ClientIssueAttachment[] {
  const list: unknown[] = Array.isArray(plural)
    ? plural
    : plural == null && singular != null
      ? [singular]
      : plural != null && !Array.isArray(plural)
        ? [plural]
        : [];

  const seen = new Set<number>();
  const out: ClientIssueAttachment[] = [];
  for (const item of list) {
    const att = normalizeAttachment(item, fallbackType);
    if (!att || seen.has(att.id)) continue;
    seen.add(att.id);
    out.push(att);
  }
  return out;
}

function linkFromUnknown(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['url', 'link', 'href', 'value'] as const) {
      const candidate = record[key];
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return null;
}

function coerceLinkList(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        return coerceLinkList(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  if (Array.isArray(value)) {
    return value.map(linkFromUnknown).filter((v): v is string => !!v);
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map(linkFromUnknown)
      .filter((v): v is string => !!v);
  }
  return [];
}

function parseIssueLinks(obj: Record<string, unknown>): string[] {
  return normalizeImportantLinks(coerceLinkList(obj.links));
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
    imageAttachments: normalizeAttachments(
      obj.imageAttachments ?? obj.image_attachments,
      obj.imageAttachment ?? obj.image_attachment,
      'image',
    ),
    fileAttachments: normalizeAttachments(
      obj.fileAttachments ?? obj.file_attachments,
      obj.fileAttachment ?? obj.file_attachment,
      'file',
    ),
    links: parseIssueLinks(obj),
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

/** Normalize a single issue from create/update/upload API responses. */
export function normalizeClientIssue(raw: unknown): ClientIssue | null {
  return normalizeIssue(raw);
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
