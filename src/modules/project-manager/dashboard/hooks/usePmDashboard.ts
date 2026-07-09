import { useQuery } from '@tanstack/react-query';
import { getAvatarColor } from '@/shared/utils';
import { pmDashboardApi } from '../api/dashboard.api';
import { pmProjectsApi } from '../../projects/api/project.api';
import type { PmProjectListItem } from '../../projects/types/project.types';
import type {
  PmDashboardProject,
  PmDashboardSummary,
  PmProjectStatusKey,
} from '../types/dashboard.types';

export interface PmProjectMemberVM {
  id:      string;
  name:    string;
  initial: string;
  color:   string;
}

export interface PmProjectVM {
  id:               number;
  name:             string;
  status:           PmProjectStatusKey;
  statusLabel:      string;
  projectTypeLabel: string;
  tasksCompleted:   number;
  tasksTotal:       number;
  progressPercent:  number;
  team:             PmProjectMemberVM[];
  teamMembersCount: number;
  githubLink:       string | null;
  driveLink:        string | null;
  isDraft:          boolean;
}

export type PmProjectSectionKey = PmProjectStatusKey | 'draft';

export interface PmProjectSectionVM {
  key:      PmProjectSectionKey;
  labelAr:  string;
  labelEn:  string;
  total:    number;
  projects: PmProjectVM[];
}

const SECTION_LABELS: Record<PmProjectStatusKey, { ar: string; en: string }> = {
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress'  },
  completed:   { ar: 'مكتمل',       en: 'Completed'    },
  on_hold:     { ar: 'معلق',        en: 'On Hold'      },
  not_started: { ar: 'لم يبدأ',     en: 'Not Started'  },
};

function toProjectVM(p: PmDashboardProject): PmProjectVM {
  return {
    id:               p.id,
    name:             p.name,
    status:           p.status,
    statusLabel:      p.statusLabel,
    projectTypeLabel: p.projectTypeLabel,
    tasksCompleted:   p.tasksCompleted,
    tasksTotal:       p.tasksTotal,
    progressPercent:  p.progressPercent,
    teamMembersCount: p.teamMembersCount,
    githubLink:       p.githubLink ?? null,
    driveLink:        p.driveLink ?? null,
    isDraft:          false,
    team: p.teamMembers.map(m => ({
      id:      m.id,
      name:    m.name,
      initial: m.avatarInitial,
      color:   getAvatarColor(m.id),
    })),
  };
}

// Drafts come from the list endpoint (the dashboard endpoint omits them), so
// they lack task/progress/team detail — surface the essentials + a draft flag.
function draftToProjectVM(p: PmProjectListItem): PmProjectVM {
  return {
    id:               p.id,
    name:             p.name,
    status:           (p.status as PmProjectStatusKey) || 'not_started',
    statusLabel:      p.statusLabel,
    projectTypeLabel: p.projectTypeLabel,
    tasksCompleted:   0,
    tasksTotal:       0,
    progressPercent:  0,
    teamMembersCount: 0,
    githubLink:       p.githubLink ?? null,
    driveLink:        p.driveLink ?? null,
    isDraft:          true,
    team:             [],
  };
}

const EMPTY_SUMMARY: PmDashboardSummary = { inProgress: 0, completed: 0, onHold: 0, notStarted: 0 };

export interface PmDashboardStats {
  dailyReports:   number;
  activeTasks:    number;
  activeProjects: number;
}

function computeStats(sections: PmProjectSectionVM[]): PmDashboardStats {
  const allProjects = sections.flatMap(s => s.projects).filter(p => !p.isDraft);

  const activeTasks = allProjects
    .filter(p => p.status === 'in_progress')
    .reduce((sum, p) => sum + Math.max(0, p.tasksTotal - p.tasksCompleted), 0);

  const activeProjects = allProjects
    .filter(p => p.status === 'in_progress' || p.status === 'on_hold')
    .length;

  // No daily-reports endpoint yet — placeholder until the reports module is wired to a real API.
  return { dailyReports: 0, activeTasks, activeProjects };
}

export function usePmDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pm-dashboard'],
    queryFn:  () => pmDashboardApi.get().then(r => r.data.data),
    staleTime: 60_000,
  });

  const { data: drafts } = useQuery({
    queryKey: ['pm-drafts'],
    queryFn:  () => pmProjectsApi.list({ is_draft: true, per_page: 100 }).then(r => r.data.data.data),
    staleTime: 60_000,
  });

  const statusSections: PmProjectSectionVM[] = (data?.projects?.sections ?? data?.myProjects?.sections ?? []).map(s => ({
    key:      s.key,
    labelAr:  SECTION_LABELS[s.key]?.ar ?? s.label,
    labelEn:  SECTION_LABELS[s.key]?.en ?? s.label,
    total:    s.total,
    projects: s.projects.map(toProjectVM),
  }));

  const draftProjects = (drafts ?? []).map(draftToProjectVM);
  const draftSection: PmProjectSectionVM[] = draftProjects.length > 0
    ? [{ key: 'draft', labelAr: 'المسودات', labelEn: 'Drafts', total: draftProjects.length, projects: draftProjects }]
    : [];

  const sections = [...statusSections, ...draftSection];

  return {
    isLoading,
    isError,
    summary: data?.summary ?? EMPTY_SUMMARY,
    sections,
    stats: computeStats(sections),
    checkIn: data?.checkIn ?? null,
  };
}
