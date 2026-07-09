import { useState, useRef } from 'react';
import { ClipboardList, Users, ListChecks, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { WorkTimerCard } from '@/shared/modules/attendance/components/WorkTimerCard';
import { StatCard }        from '@/shared/components/ui/StatCard';
import { ProjectsSection } from '../components/ProjectsSection';
import { ProjectDashboardSkeleton } from '../components/ProjectDashboardSkeleton';
import { usePmDashboard } from '../hooks/usePmDashboard';
import { usePmTeamCount } from '../../team/hooks/usePmTeamCount';

export function ProjectDashboardPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { isLoading, sections, stats, checkIn } = usePmDashboard();
  const teamCount = usePmTeamCount();

  const [activeSectionKey, setActiveSectionKey] = useState<string | undefined>(undefined);
  const projectsRef = useRef<HTMLDivElement>(null);

  if (isLoading) return <ProjectDashboardSkeleton />;

  function focusInProgress() {
    setActiveSectionKey('in_progress');
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="space-y-6">

      <WorkTimerCard layoutScope="pm" variant="card" initialData={checkIn} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList size={22} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          value={stats.dailyReports}
          labelAr="التقارير اليومية"
          labelEn="Daily Reports"
          isAr={isAr}
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.REPORTS)}
        />
        <StatCard
          icon={<Users size={22} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={teamCount}
          labelAr="أعضاء الفريق"
          labelEn="Team Members"
          isAr={isAr}
          onClick={() => navigate(ROUTES.PROJECT_MANAGER.TEAM)}
        />
        <StatCard
          icon={<ListChecks size={22} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={stats.activeTasks}
          labelAr="المهام قيد التنفيذ"
          labelEn="Active Tasks"
          isAr={isAr}
          onClick={focusInProgress}
        />
        <StatCard
          icon={<FolderKanban size={22} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={stats.activeProjects}
          labelAr="المشاريع النشطة"
          labelEn="Active Projects"
          isAr={isAr}
          onClick={focusInProgress}
        />
      </div>

      {/* Projects list */}
      <div ref={projectsRef}>
        <ProjectsSection
          sections={sections}
          activeKey={activeSectionKey ?? sections[0]?.key}
          onActiveKeyChange={setActiveSectionKey}
          isAr={isAr}
          onNewProject={() => navigate(ROUTES.PROJECT_MANAGER.NEW)}
        />
      </div>

    </div>
  );
}
