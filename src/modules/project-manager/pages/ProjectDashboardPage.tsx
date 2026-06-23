import { useState } from 'react';
import { Plus, ClipboardList, Users, ListChecks, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES }   from '@/app/router/routes';
import { Card }         from '@/shared/components/ui/Card';
import { useProjects }  from '../store/projectStore';
import type { Project, ProjectStatus, TeamMember } from '../types/project.types';

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, { ar: string; en: string; dot: string }> = {
  inProgress:  { ar: 'قيد التنفيذ', en: 'In Progress', dot: 'bg-[#A0CD39]' },
  completed:   { ar: 'مكتمل',       en: 'Completed',   dot: 'bg-emerald-500' },
  paused:      { ar: 'متوقف',       en: 'Paused',      dot: 'bg-amber-500'  },
  notStarted:  { ar: 'لم يبدأ',     en: 'Not Started', dot: 'bg-gray-400'   },
};

const STATUS_BADGE: Record<ProjectStatus, string> = {
  inProgress: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]',
  completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused:     'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  notStarted: 'bg-gray-100   text-gray-500   dark:bg-gray-700      dark:text-gray-400',
};

const TABS: { status: ProjectStatus; labelAr: string; labelEn: string }[] = [
  { status: 'inProgress', labelAr: 'قيد التنفيذ', labelEn: 'In Progress' },
  { status: 'completed',  labelAr: 'مكتمل',       labelEn: 'Completed'  },
  { status: 'paused',     labelAr: 'متوقف',       labelEn: 'Paused'     },
  { status: 'notStarted', labelAr: 'لم يبدأ',     labelEn: 'Not Started' },
];

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, iconBg, value, labelAr, labelEn, isAr }: {
  icon:    React.ReactElement;
  iconBg:  string;
  value:   number;
  labelAr: string;
  labelEn: string;
  isAr:    boolean;
}) {
  return (
    <Card className="px-5 py-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isAr ? labelAr : labelEn}</p>
      </div>
    </Card>
  );
}

function TeamAvatars({ team }: { team: TeamMember[] }) {
  const shown = team.slice(0, 4);
  const extra = team.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div
          key={i}
          title={m.name}
          className={`w-7 h-7 rounded-full border-2 border-white dark:border-gray-800
                      flex items-center justify-center text-xs font-bold text-white
                      shrink-0 ${m.color} ${i > 0 ? '-ms-2' : ''}`}
        >
          {m.initial}
        </div>
      ))}
      {extra > 0 && (
        <div className="-ms-2 w-7 h-7 rounded-full border-2 border-white dark:border-gray-800
                        bg-gray-200 dark:bg-gray-600 flex items-center justify-center
                        text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
          +{extra}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, isAr }: { project: Project; isAr: boolean }) {
  const label = STATUS_LABEL[project.status];
  const badge = STATUS_BADGE[project.status];

  return (
    <Card className="p-5 flex flex-col gap-4 transition-all duration-200
                     hover:border-[#A0CD39] hover:shadow-lg">

      {/* Title + category */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
          {isAr ? project.nameAr : project.nameEn}
        </h3>
        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full border
                         border-gray-200 dark:border-gray-600
                         text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {isAr ? project.categoryAr : project.categoryEn}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{project.progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {isAr ? 'المهام:' : 'Tasks:'}
            <span className="ms-1 font-semibold text-gray-800 dark:text-gray-100">
              {project.tasksCompleted}/{project.tasksTotal}
            </span>
          </span>
          <span>
            {isAr ? 'الحالة:' : 'Status:'}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium
                            px-2.5 py-1 rounded-full ${badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${label.dot}`} />
            {isAr ? label.ar : label.en}
          </span>
        </div>
        <TeamAvatars team={project.team} />
      </div>

      {/* Details button */}
      <button
        type="button"
        className="w-full py-2 rounded-xl text-sm font-medium
                   border border-gray-200 dark:border-gray-600
                   text-gray-600 dark:text-gray-300
                   hover:border-[#A0CD39] hover:text-[#709028] dark:hover:text-[#A0CD39]
                   transition-colors duration-150"
      >
        {isAr ? 'تفاصيل المشروع' : 'View Details'}
      </button>
    </Card>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export function ProjectDashboardPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const projects = useProjects();
  const [activeTab, setActiveTab] = useState<ProjectStatus>('inProgress');

  const countByStatus = (s: ProjectStatus) => projects.filter(p => p.status === s).length;

  const visibleProjects = projects.filter(p => p.status === activeTab);

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

      {/* ── Stat cards */}
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

      {/* ── Projects section */}
      <Card>

        {/* Header — button only */}
        <div className="flex items-center justify-end px-5 pt-5 pb-0">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROJECT_MANAGER.NEW)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                       bg-[#A0CD39] hover:bg-[#709028] text-white
                       text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            {isAr ? 'مشروع جديد' : 'New Project'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-end gap-1 px-5 mt-4 border-b border-gray-100 dark:border-gray-700/60">
          {TABS.map(tab => {
            const count    = countByStatus(tab.status);
            const isActive = activeTab === tab.status;
            return (
              <button
                key={tab.status}
                type="button"
                onClick={() => setActiveTab(tab.status)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium
                            border-b-2 transition-colors duration-150 whitespace-nowrap
                            ${isActive
                              ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
                <span className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold
                                  flex items-center justify-center
                                  ${isActive
                                    ? 'bg-[#A0CD39] text-gray-900'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Project grid */}
        <div className="p-5">
          {visibleProjects.length === 0 ? (
            <div className="py-16 text-center">
              <FolderKanban size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {isAr ? 'لا توجد مشاريع في هذه الحالة' : 'No projects in this status'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleProjects.map(project => (
                <ProjectCard key={project.id} project={project} isAr={isAr} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
