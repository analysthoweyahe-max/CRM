import { useQuery } from '@tanstack/react-query';
import { getAvatarColor } from '@/shared/utils';
import { pmDashboardApi } from '../api/dashboard.api';
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
  workspaceUrl:     string;
}

export interface PmProjectSectionVM {
  key:      PmProjectStatusKey;
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
    workspaceUrl:     p.workspaceUrl,
    team: p.teamMembers.map(m => ({
      id:      m.id,
      name:    m.name,
      initial: m.avatarInitial,
      color:   getAvatarColor(m.id),
    })),
  };
}

const EMPTY_SUMMARY: PmDashboardSummary = { inProgress: 0, completed: 0, onHold: 0, notStarted: 0 };

export interface PmDashboardStats {
  dailyReports:   number;
  activeTasks:    number;
  activeProjects: number;
}

function computeStats(sections: PmProjectSectionVM[]): PmDashboardStats {
  const allProjects = sections.flatMap(s => s.projects);

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

  const sections: PmProjectSectionVM[] = (data?.projects.sections ?? []).map(s => ({
    key:      s.key,
    labelAr:  SECTION_LABELS[s.key]?.ar ?? s.label,
    labelEn:  SECTION_LABELS[s.key]?.en ?? s.label,
    total:    s.total,
    projects: s.projects.map(toProjectVM),
  }));

  return {
    isLoading,
    isError,
    summary: data?.summary ?? EMPTY_SUMMARY,
    sections,
    stats: computeStats(sections),
  };
}
