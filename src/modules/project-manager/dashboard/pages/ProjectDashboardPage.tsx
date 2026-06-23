import { ClipboardList, Users, ListChecks, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { useProjects } from '../../projects/store/projectStore';
import { StatCard }        from '../components/StatCard';
import { ProjectsSection } from '../components/ProjectsSection';

export function ProjectDashboardPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const projects = useProjects();

  const totalMembers = new Set(
    projects.flatMap(p => p.team.map(m => m.name))
  ).size;

  const activeTasks = projects
    .filter(p => p.status === 'inProgress')
    .reduce((sum, p) => sum + (p.tasksTotal - p.tasksCompleted), 0);

  const activeProjects = projects.filter(
    p => p.status === 'inProgress' || p.status === 'paused'
  ).length;

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList size={22} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          value={2}
          labelAr="التقارير اليومية"
          labelEn="Daily Reports"
          isAr={isAr}
        />
        <StatCard
          icon={<Users size={22} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={totalMembers}
          labelAr="أعضاء الفريق"
          labelEn="Team Members"
          isAr={isAr}
        />
        <StatCard
          icon={<ListChecks size={22} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={activeTasks}
          labelAr="المهام قيد التنفيذ"
          labelEn="Active Tasks"
          isAr={isAr}
        />
        <StatCard
          icon={<FolderKanban size={22} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={activeProjects}
          labelAr="المشاريع النشطة"
          labelEn="Active Projects"
          isAr={isAr}
        />
      </div>

      {/* Projects list */}
      <ProjectsSection
        projects={projects}
        isAr={isAr}
        onNewProject={() => navigate(ROUTES.PROJECT_MANAGER.NEW)}
      />

    </div>
  );
}
