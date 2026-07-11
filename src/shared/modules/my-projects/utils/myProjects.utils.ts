import { ROUTES } from '@/app/router/routes';
import type { Role } from '@/shared/types/role.types';
import type {
  DashboardProjectCard,
  MyProjectsModule,
  MyProjectsPageConfig,
  PmProject,
  ProjectSection,
  ProjectStatus,
  SeoProject,
} from '../types/myProjects.types';

export function resolveMyProjectsConfig(role: Role, module: MyProjectsModule): MyProjectsPageConfig {
  const isPmEmployee   = module === 'pm' && role === 'employee';
  const isSeoEmployee  = module === 'seo' && role === 'seo-member';
  const isSeoManager   = module === 'seo' && (role === 'seo-leader' || role === 'admin');

  if (isSeoEmployee) {
    return {
      module,
      viewMode:        'sections',
      canSearch:       false,
      canFilterStatus: false,
      canToggleDraft:  false,
      canCreate:       false,
      showManager:     false,
      showTasksButton: true,
      createPath:      ROUTES.SEO_LEADER.NEW,
      workspacePath:   (id) => ROUTES.SEO_MEMBER.DETAILS(id),
      tasksPath:       (id) => ROUTES.SEO_MEMBER.DETAILS(id),
    };
  }

  if (isPmEmployee) {
    return {
      module,
      viewMode:        'sections',
      canSearch:       false,
      canFilterStatus: false,
      canToggleDraft:  false,
      canCreate:       false,
      showManager:     false,
      showTasksButton: true,
      createPath:      ROUTES.PROJECT_MANAGER.NEW,
      workspacePath:   (id) => ROUTES.EMPLOYEE.PROJECT_TASKS(id),
      tasksPath:       (id) => ROUTES.EMPLOYEE.PROJECT_TASKS(id),
    };
  }

  if (isSeoManager) {
    return {
      module,
      viewMode:        'paginated',
      canSearch:       true,
      canFilterStatus: true,
      canToggleDraft:  true,
      canCreate:       true,
      showManager:     false,
      showTasksButton: false,
      createPath:      ROUTES.SEO_LEADER.NEW,
      workspacePath:   (id) => ROUTES.SEO_LEADER.DETAILS(String(id)),
      tasksPath:       (id) => ROUTES.SEO_LEADER.DETAILS(String(id)),
    };
  }

  // PM manager / super-admin on PM module
  return {
    module,
    viewMode:        'paginated',
    canSearch:       true,
    canFilterStatus: true,
    canToggleDraft:  true,
    canCreate:       true,
    showManager:     role === 'admin',
    showTasksButton: false,
    createPath:      ROUTES.PROJECT_MANAGER.NEW,
    workspacePath:   (id) => ROUTES.PROJECT_MANAGER.DETAILS(String(id)),
    tasksPath:       (_id) => ROUTES.EMPLOYEE.TASKS,
  };
}

export function formatContractMonths(months: number | null | undefined, isAr: boolean): string | null {
  if (months == null || months <= 0) return null;
  return isAr ? `${months} شهر` : `${months} mo`;
}

export function calcProgress(completed?: number, total?: number, fallback?: number): number | null {
  if (fallback != null) return Math.min(100, Math.max(0, fallback));
  if (total == null || total <= 0) return null;
  const done = completed ?? 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export const STATUS_BADGE: Record<string, { dot: string; badge: string }> = {
  in_progress: { dot: 'bg-[#A0CD39]',    badge: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]' },
  not_started: { dot: 'bg-gray-400',     badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
  on_hold:     { dot: 'bg-amber-500',    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  completed:   { dot: 'bg-emerald-500',  badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

export const STATUS_BADGE_FALLBACK = {
  dot:   'bg-gray-400',
  badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

export const PER_PAGE = 15;

const SECTION_ORDER: ProjectStatus[] = ['in_progress', 'completed', 'on_hold', 'not_started'];

const SECTION_LABEL_FALLBACK: Record<ProjectStatus, { ar: string; en: string }> = {
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress' },
  completed:   { ar: 'مكتمل',        en: 'Completed' },
  on_hold:     { ar: 'معلق',         en: 'On Hold' },
  not_started: { ar: 'لم يبدأ',      en: 'Not Started' },
};

/** Group a flat project list (e.g. from `/v1/employee/projects`) into the
 * same fixed status sections `/v1/pm/dashboard` used to provide — that
 * endpoint's aggregation is unreliable, so this rebuilds the same shape
 * client-side from a source confirmed to actually list the employee's projects. */
export function groupProjectsIntoSections(projects: PmProject[], isAr: boolean): ProjectSection[] {
  return SECTION_ORDER.map((key) => {
    const inSection = projects.filter(p => p.status === key);
    const label = inSection[0]?.statusLabel || SECTION_LABEL_FALLBACK[key][isAr ? 'ar' : 'en'];

    return {
      key,
      label,
      defaultExpanded: key === 'in_progress',
      total: inSection.length,
      projects: inSection.map((p): DashboardProjectCard => ({
        id:              p.id,
        name:            p.name,
        clientName:      p.projectTypeLabel,
        status:          p.status,
        statusLabel:     p.statusLabel,
        workspaceUrl:    p.workspaceUrl ?? '',
        tasksUrl:        p.tasksUrl ?? undefined,
        progressPercent: p.progressPercent,
        tasksAssigned:   p.tasksTotal,
        tasksCompleted:  p.tasksCompleted,
      })),
    };
  });
}

/** Same section grouping for SEO employee projects from `/v1/seo/employee/projects`. */
export function groupSeoProjectsIntoSections(projects: SeoProject[], isAr: boolean): ProjectSection[] {
  const known = projects.filter(p => SECTION_ORDER.includes(p.status));
  const unknown = projects.filter(p => !SECTION_ORDER.includes(p.status));

  const sections = SECTION_ORDER.map((key) => {
    const inSection = known.filter(p => p.status === key);
    const label = inSection[0]?.statusLabel || SECTION_LABEL_FALLBACK[key][isAr ? 'ar' : 'en'];

    return {
      key,
      label,
      defaultExpanded: key === 'in_progress',
      total: inSection.length,
      projects: inSection.map((p): DashboardProjectCard => ({
        id:              p.id,
        name:            p.name,
        clientName:      p.campaignTypeLabel || undefined,
        status:          p.status,
        statusLabel:     p.statusLabel,
        workspaceUrl:    p.workspaceUrl ?? '',
        tasksUrl:        p.tasksUrl ?? undefined,
        progressPercent: p.progressPercent,
        tasksAssigned:   p.tasksAssigned,
        tasksCompleted:  p.tasksCompleted,
        tasksInProgress: p.tasksInProgress,
      })),
    };
  });

  // Projects with missing/unknown status still need to appear for the member.
  if (unknown.length > 0) {
    const fallback = sections.find(s => s.key === 'in_progress') ?? sections[0];
    if (fallback) {
      fallback.projects.push(...unknown.map((p): DashboardProjectCard => ({
        id:              p.id,
        name:            p.name,
        clientName:      p.campaignTypeLabel || undefined,
        status:          'in_progress',
        statusLabel:     p.statusLabel || SECTION_LABEL_FALLBACK.in_progress[isAr ? 'ar' : 'en'],
        workspaceUrl:    p.workspaceUrl ?? '',
        tasksUrl:        p.tasksUrl ?? undefined,
        progressPercent: p.progressPercent,
        tasksAssigned:   p.tasksAssigned,
        tasksCompleted:  p.tasksCompleted,
        tasksInProgress: p.tasksInProgress,
      })));
      fallback.total = fallback.projects.length;
    }
  }

  return sections.filter(s => s.total > 0);
}
