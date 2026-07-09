import { isSeoLabel } from '@/modules/project-manager/projects/utils/seoProject';

const SEO_ROLE_SLUGS = new Set([
  'seo-employee',
  'seo-member',
  'seo-leader',
  'seo-manager',
]);

const PM_ROLE_SLUGS = new Set([
  'pm-employee',
  'employee',
  'manager',
  'project-manager',
]);

export interface TeamMemberManagerRef {
  managerId?: string | null;
  manager?:   { id?: string | null } | null;
}

export interface PmTeamScopeFields extends TeamMemberManagerRef {
  department?:   string | null;
  departmentAr?: string | null;
  jobTitle?:     string | null;
  roles?:        string[];
}

export interface SeoTeamScopeFields extends TeamMemberManagerRef {
  department?:   string | null;
  departmentAr?: string | null;
  jobTitle?:     string | { name?: string | null } | null;
  team?:         { name?: string | null; nameAr?: string | null } | null;
  roles?:        string[];
}

function hasSeoRole(roles?: string[]): boolean {
  return (roles ?? []).some(role => SEO_ROLE_SLUGS.has(role));
}

function hasPmRole(roles?: string[]): boolean {
  return (roles ?? []).some(role => PM_ROLE_SLUGS.has(role));
}

function jobTitleLabel(jobTitle?: string | { name?: string | null } | null): string | null {
  if (!jobTitle) return null;
  return typeof jobTitle === 'string' ? jobTitle : (jobTitle.name ?? null);
}

export function isSeoScopedMember(member: SeoTeamScopeFields): boolean {
  if (hasSeoRole(member.roles)) return true;

  const title = jobTitleLabel(member.jobTitle);
  if (isSeoLabel(member.department, member.departmentAr)) return true;
  if (isSeoLabel(title, null)) return true;
  if (member.team && isSeoLabel(member.team.name, member.team.nameAr)) return true;

  return false;
}

export function isPmScopedMember(member: PmTeamScopeFields): boolean {
  if (hasSeoRole(member.roles)) return false;
  if (isSeoLabel(member.department, member.departmentAr)) return false;
  if (isSeoLabel(member.jobTitle, null)) return false;

  // When roles are present, keep only PM-side employees.
  if (member.roles?.length) return hasPmRole(member.roles);

  return true;
}

export function belongsToViewer(
  member: TeamMemberManagerRef,
  viewerId?: string | null,
): boolean {
  if (!viewerId) return true;
  const managerId = member.managerId ?? member.manager?.id ?? null;
  return managerId === viewerId;
}

function membersExposeManager<T extends TeamMemberManagerRef>(members: T[]): boolean {
  return members.some(m => Boolean(m.managerId ?? m.manager?.id));
}

export function filterPmTeamMembers<T extends PmTeamScopeFields>(
  members: T[],
  options: { viewerId?: string | null; isAdmin?: boolean } = {},
): T[] {
  const { viewerId, isAdmin = false } = options;
  const scopeByManager = !isAdmin && Boolean(viewerId) && membersExposeManager(members);

  return members.filter(member => {
    if (!isPmScopedMember(member)) return false;
    if (!scopeByManager) return true;
    return belongsToViewer(member, viewerId);
  });
}

export function filterSeoTeamMembers<T extends SeoTeamScopeFields>(
  members: T[],
  options: { viewerId?: string | null; isAdmin?: boolean } = {},
): T[] {
  const { viewerId, isAdmin = false } = options;
  const scopeByManager = !isAdmin && Boolean(viewerId) && membersExposeManager(members);

  return members.filter(member => {
    if (!isSeoScopedMember(member)) return false;
    if (!scopeByManager) return true;
    return belongsToViewer(member, viewerId);
  });
}
