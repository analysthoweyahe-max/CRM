import type { MentionRef } from '@/shared/components/chat';
import { toMentionRefs } from '@/shared/utils/mentionComposer.utils';

/** Read edited flag from camelCase or snake_case API payloads. */
export function normalizeIsEdited(raw: {
  isEdited?: boolean | null;
  is_edited?: boolean | null;
  editedAt?: string | null;
  edited_at?: string | null;
} | null | undefined): boolean {
  if (!raw) return false;
  if (raw.isEdited === true || raw.is_edited === true) return true;
  return !!(raw.editedAt || raw.edited_at);
}

export function normalizeEditedAt(raw: {
  editedAt?: string | null;
  edited_at?: string | null;
} | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.editedAt ?? raw.edited_at;
  return typeof v === 'string' && v.trim() ? v : null;
}

/**
 * Compare comment/message sender.id to the current user.
 * Backend sender.id uses employee/admin uuid — match against both id and employeeId
 * because AuthUser.employeeId may be employeeNumber for some logins.
 */
export function isSameActorId(
  senderId: string | number | null | undefined,
  user: { id?: string | null; employeeId?: string | null } | null | undefined,
): boolean {
  if (senderId == null || !user) return false;
  const sid = String(senderId);
  if (user.id && sid === String(user.id)) return true;
  if (user.employeeId && sid === String(user.employeeId)) return true;
  return false;
}

/** Drop the signed-in user from mention / add-member pickers. */
export function excludeSelfFromActors<T extends { id: string | number }>(
  items: T[] | null | undefined,
  user: { id?: string | null; employeeId?: string | null } | null | undefined,
): T[] {
  if (!items?.length) return [];
  if (!user) return [...items];
  return items.filter(item => !isSameActorId(item.id, user));
}

const SUPER_ADMIN_ROLE_SLUGS = new Set([
  'super-admin',
]);

const SEO_LEADER_ROLE_SLUGS = new Set([
  'seo-manager',
  'seo-leader',
]);

const PM_MANAGER_ROLE_SLUGS = new Set([
  'project-manager',
  'manager',
  'pm-manager',
]);

function pushRoleSlug(out: string[], value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    out.push(value.trim().toLowerCase());
  }
}

/** Collect role slugs from common mentionable payload shapes. */
function collectMentionableRoleSlugs(item: unknown): string[] {
  if (!item || typeof item !== 'object') return [];
  const rec = item as Record<string, unknown>;
  const roles: string[] = [];

  pushRoleSlug(roles, rec.role);
  pushRoleSlug(roles, rec.roleName);
  pushRoleSlug(roles, rec.role_name);
  pushRoleSlug(roles, rec.roleSlug);
  pushRoleSlug(roles, rec.role_slug);

  if (Array.isArray(rec.roles)) {
    for (const entry of rec.roles) {
      if (typeof entry === 'string') {
        pushRoleSlug(roles, entry);
        continue;
      }
      if (entry && typeof entry === 'object') {
        const r = entry as Record<string, unknown>;
        pushRoleSlug(roles, r.name);
        pushRoleSlug(roles, r.slug);
        pushRoleSlug(roles, r.role);
      }
    }
  }

  return roles;
}

function mentionableHasAnyRole(item: unknown, allowed: Set<string>): boolean {
  return collectMentionableRoleSlugs(item).some((slug) => allowed.has(slug));
}

function isProjectTeammate(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  const type = String((item as { type?: unknown }).type ?? '').toLowerCase();
  return type === 'employee';
}

function isAllowedMentionable(item: unknown, allowedAdminRoles: Set<string>): boolean {
  if (isProjectTeammate(item)) return true;
  if (mentionableHasAnyRole(item, SUPER_ADMIN_ROLE_SLUGS)) return true;
  return mentionableHasAnyRole(item, allowedAdminRoles);
}

/**
 * SEO project/task @mentions — allow only:
 * super-admins + SEO leaders/managers + project teammates (type=employee).
 */
export function filterSeoProjectMentions<T>(items: T[] | null | undefined): T[] {
  if (!items?.length) return [];
  return items.filter((item) => isAllowedMentionable(item, SEO_LEADER_ROLE_SLUGS));
}

/**
 * PM project/task @mentions — allow only:
 * super-admins + PM managers + project teammates (type=employee).
 */
export function filterPmProjectMentions<T>(items: T[] | null | undefined): T[] {
  if (!items?.length) return [];
  return items.filter((item) => isAllowedMentionable(item, PM_MANAGER_ROLE_SLUGS));
}

export function normalizeMentions(raw: unknown): MentionRef[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return toMentionRefs(raw);
}

/** Normalize a messenger message at the API boundary (camelCase internals). */
export function normalizeSeoMessage<T extends { id: string | number; body: string | null; sender: unknown }>(
  raw: T,
): T & {
  isEdited: boolean;
  editedAt: string | null;
} {
  return {
    ...raw,
    isEdited: normalizeIsEdited(raw as Parameters<typeof normalizeIsEdited>[0]),
    editedAt: normalizeEditedAt(raw as Parameters<typeof normalizeEditedAt>[0]),
    ...(Array.isArray((raw as { mentions?: unknown }).mentions)
      ? { mentions: normalizeMentions((raw as { mentions?: unknown }).mentions) }
      : {}),
  };
}

/**
 * Messages list page 1 is newest-first (DESC).
 * Reverse so the UI stays chronological (oldest → newest, top → bottom).
 */
export function toChronologicalMessages<T>(msgs: T[] | null | undefined): T[] {
  if (!msgs?.length) return [];
  return [...msgs].reverse();
}

export function normalizeTaskCommentFields(raw: {
  isEdited?: boolean | null;
  is_edited?: boolean | null;
  editedAt?: string | null;
  edited_at?: string | null;
  mentions?: unknown;
}): { isEdited: boolean; editedAt: string | null; mentions?: MentionRef[] } {
  const mentions = normalizeMentions(raw.mentions);
  return {
    isEdited: normalizeIsEdited(raw),
    editedAt: normalizeEditedAt(raw),
    ...(mentions ? { mentions } : {}),
  };
}
