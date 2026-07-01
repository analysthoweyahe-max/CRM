import { useState }    from 'react';
import { CheckCircle, Eye, RefreshCw, Clock, ChevronDown, FolderOpen } from 'lucide-react';
import { useLang }     from '@/app/providers/LanguageProvider';
import { useAuth }     from '@/modules/auth/context/AuthContext';
import { DashboardStatCard }      from '@/shared/components/ui/DashboardStatCard';
import { useSeoMemberDashboard }  from '../hooks/useSeoMemberDashboard';
import type { ProjectSection }    from '../types/seoMemberDashboard.types';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}

// ─── Project section accordion ───────────────────────────────────────────────

function ProjectSectionCard({ section, isAr }: { section: ProjectSection; isAr: boolean }) {
  const [expanded, setExpanded] = useState(section.defaultExpanded);

  return (
    <div className="border border-gray-100 dark:border-gray-700/60 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3
                   bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50
                   transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {section.label}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full
                           bg-[#D8EBAE] dark:bg-[#A0CD39]/20 text-[#709028] dark:text-[#A0CD39]">
            {section.total}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/40 space-y-2">
          {section.projects.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
              <FolderOpen size={16} className="opacity-50" />
              <p className="text-xs">{isAr ? 'لا توجد مشاريع' : 'No projects'}</p>
            </div>
          ) : (
            section.projects.map(project => (
              <div
                key={project.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                           bg-white dark:bg-gray-800
                           border border-gray-100 dark:border-gray-700/40"
              >
                <div className="w-2 h-2 rounded-full bg-[#A0CD39] shrink-0" />
                <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{project.name}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function SeoMemberDashboardPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const { user }  = useAuth();
  const { tasksOverview, sections, isLoading } = useSeoMemberDashboard();

  if (isLoading) return <DashboardSkeleton />;

  const greeting = isAr
    ? `مرحباً، ${user?.fullName ?? ''} 👋`
    : `Welcome, ${user?.fullName ?? ''} 👋`;

  const pending = Math.max(0, tasksOverview.totalAssigned - tasksOverview.completed - tasksOverview.inProgress);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{greeting}</h1>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={<CheckCircle size={20} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={tasksOverview.completed}
          labelAr="مكتمل"
          labelEn="Completed"
          isAr={isAr}
        />
        <DashboardStatCard
          icon={<Eye size={20} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={0}
          labelAr="بحاجة للمراجعة"
          labelEn="Needs Review"
          isAr={isAr}
        />
        <DashboardStatCard
          icon={<RefreshCw size={20} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={tasksOverview.inProgress}
          labelAr="قيد التنفيذ"
          labelEn="In Progress"
          isAr={isAr}
        />
        <DashboardStatCard
          icon={<Clock size={20} className="text-gray-500" />}
          iconBg="bg-gray-100 dark:bg-gray-700"
          value={pending}
          labelAr="قيد الانتظار"
          labelEn="Pending"
          isAr={isAr}
        />
      </div>

      {/* My projects */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {isAr ? 'مشاريعي' : 'My Projects'}
        </h2>
        <div className="space-y-3">
          {sections.map(section => (
            <ProjectSectionCard key={section.key} section={section} isAr={isAr} />
          ))}
        </div>
      </div>

    </div>
  );
}
