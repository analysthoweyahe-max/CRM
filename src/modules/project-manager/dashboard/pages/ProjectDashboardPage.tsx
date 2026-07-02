import { PlayCircle, CheckCircle2, PauseCircle, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { StatCard }        from '@/shared/components/ui/StatCard';
import { ProjectsSection } from '../components/ProjectsSection';
import { ProjectDashboardSkeleton } from '../components/ProjectDashboardSkeleton';
import { usePmDashboard } from '../hooks/usePmDashboard';

export function ProjectDashboardPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { isLoading, summary, sections } = usePmDashboard();

  if (isLoading) return <ProjectDashboardSkeleton />;

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<PlayCircle size={22} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={summary.inProgress}
          labelAr="قيد التنفيذ"
          labelEn="In Progress"
          isAr={isAr}
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          value={summary.completed}
          labelAr="مكتمل"
          labelEn="Completed"
          isAr={isAr}
        />
        <StatCard
          icon={<PauseCircle size={22} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={summary.onHold}
          labelAr="معلق"
          labelEn="On Hold"
          isAr={isAr}
        />
        <StatCard
          icon={<Circle size={22} className="text-gray-500" />}
          iconBg="bg-gray-100 dark:bg-gray-700"
          value={summary.notStarted}
          labelAr="لم يبدأ"
          labelEn="Not Started"
          isAr={isAr}
        />
      </div>

      {/* Projects list */}
      <ProjectsSection
        sections={sections}
        isAr={isAr}
        onNewProject={() => navigate(ROUTES.PROJECT_MANAGER.NEW)}
      />

    </div>
  );
}
