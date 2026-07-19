import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvatarColor } from '@/shared/utils';
import { seoLeaderDashboardApi } from '../api/seoLeaderDashboard.api';
import { useArchivedSeoProjects } from '../../campaigns/store/seoArchivedStore';
import type { SeoDashboardProject, SeoManagerStats } from '../types/dashboard.types';

export const SEO_LEADER_DASHBOARD_KEY = ['seo-leader', 'dashboard'] as const;

export interface CampaignViewModel {
  id:                number;
  name:              string;
  description:       string;
  campaignType:      string;
  campaignTypeLabel: string;
  status:            string;
  statusLabel:       string;
  isDraft:           boolean;
  startDate:         string;
  expectedEndDate:   string | null;
  progress:          number;
  tasks_completed:   number;
  tasks_total:       number;
  team:              { name: string; initial: string; color: string }[];
  githubLink:        string | null;
}

function calcProgress(completed: number, total: number, reported?: number | null): number {
  if (reported != null && !Number.isNaN(reported)) {
    return Math.min(100, Math.max(0, Math.round(reported)));
  }
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
}

function toCampaignVM(p: SeoDashboardProject): CampaignViewModel {
  const completed = p.tasksCompleted ?? 0;
  const total     = p.tasksTotal ?? 0;
  return {
    id:                p.id,
    name:              p.name,
    description:       p.description ?? '',
    campaignType:      '',
    campaignTypeLabel: p.campaignTypeLabel ?? p.projectTypeLabel ?? '',
    status:            p.status,
    statusLabel:       p.statusLabel,
    isDraft:           p.isDraft === true,
    startDate:         p.startDate ?? '',
    expectedEndDate:   p.expectedEndDate ?? null,
    progress:          calcProgress(completed, total, p.progressPercent),
    tasks_completed:   completed,
    tasks_total:       total,
    githubLink:        p.githubLink ?? null,
    team: (p.teamMembers ?? []).map(m => ({
      name:    m.name,
      initial: m.avatarInitial || m.name.charAt(0),
      color:   getAvatarColor(m.id),
    })),
  };
}

export function useSeoLeaderDashboard() {
  const archivedIds = useArchivedSeoProjects();

  const dashboardQuery = useQuery({
    queryKey:  SEO_LEADER_DASHBOARD_KEY,
    queryFn:   () => seoLeaderDashboardApi.get().then(r => r.data.data),
    staleTime: 60_000,
  });

  const sections = dashboardQuery.data?.projects?.sections ?? [];
  const summary  = dashboardQuery.data?.summary;

  const campaigns = useMemo(() => {
    const flat = sections.flatMap(s => s.projects ?? []);
    return flat.map(p => {
      const vm = toCampaignVM(p);
      if (archivedIds.has(p.id)) {
        return { ...vm, status: 'archived', statusLabel: 'مؤرشفة' };
      }
      return vm;
    });
  }, [sections, archivedIds]);

  const stats: SeoManagerStats = {
    total_projects:     campaigns.filter(c => c.status !== 'archived').length,
    active_employees:   0,
    pending_tasks:      campaigns
      .filter(c => c.status === 'in_progress')
      .reduce((sum, c) => sum + Math.max(0, c.tasks_total - c.tasks_completed), 0),
    completed_projects: summary?.completed
      ?? campaigns.filter(c => c.status === 'completed').length,
  };

  // Prefer summary counts for the "total projects" when available
  if (summary) {
    stats.total_projects =
      (summary.inProgress ?? 0)
      + (summary.completed ?? 0)
      + (summary.onHold ?? 0)
      + (summary.notStarted ?? 0);
  }

  return {
    isLoading: dashboardQuery.isLoading,
    isError:   dashboardQuery.isError,
    stats,
    campaigns,
    summary,
    checkIn: dashboardQuery.data?.checkIn ?? null,
  };
}
