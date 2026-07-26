import { useRef, useState } from 'react';
import { ListChecks, FolderKanban } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { TaskStatDropdownCard } from '@/shared/modules/task-briefs/components/TaskStatDropdownCard';
import { TasksSection } from '@/shared/modules/task-briefs/components/TasksSection';
import { AdminStatCards }            from '../components/AdminStatCards';
import { RoleDistributionCard }      from '../components/RoleDistributionCard';
import { DepartmentDistributionCard } from '../components/DepartmentDistributionCard';
import { RecentActivityCard }        from '../components/RecentActivityCard';
import { useAdminDashboard }         from '../hooks/useAdminDashboard';
import { MyPermissionsWidget } from '@/shared/components/auth';
import { ROUTES } from '@/app/router/routes';
import { usePmTaskStats } from '@/modules/project-manager/tasks/hooks/usePmTaskStats';
import { usePmTaskBriefs } from '@/modules/project-manager/tasks/hooks/usePmTaskBriefs';
import { useSeoTaskStats } from '@/modules/seo-leader/tasks/hooks/useSeoTaskStats';
import { useSeoTaskBriefs } from '@/modules/seo-leader/tasks/hooks/useSeoTaskBriefs';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { lang }  = useLang();
  const isAr      = lang === 'ar';

  const { stats, roleDistribution, departmentDistribution, activity, isLoading } = useAdminDashboard();

  const [pmTaskStatus, setPmTaskStatus] = useState('');
  const [pmTaskProject, setPmTaskProject] = useState('');
  const [pmTaskPage, setPmTaskPage] = useState(1);
  const pmTasksRef = useRef<HTMLDivElement>(null);
  const pmTaskStats  = usePmTaskStats();
  const pmTaskBriefs = usePmTaskBriefs(pmTaskStatus, pmTaskProject, pmTaskPage);

  const [seoTaskStatus, setSeoTaskStatus] = useState('');
  const [seoTaskProject, setSeoTaskProject] = useState('');
  const [seoTaskPage, setSeoTaskPage] = useState(1);
  const seoTasksRef = useRef<HTMLDivElement>(null);
  const seoTaskStats  = useSeoTaskStats();
  const seoTaskBriefs = useSeoTaskBriefs(seoTaskStatus, seoTaskProject, seoTaskPage);

  function focusPmTasks(statusKey: string) {
    setPmTaskStatus(statusKey);
    setPmTaskProject('');
    setPmTaskPage(1);
    pmTasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function focusSeoTasks(statusKey: string) {
    setSeoTaskStatus(statusKey);
    setSeoTaskProject('');
    setSeoTaskPage(1);
    seoTasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'لوحة المشرف العام' : 'General Supervisor Dashboard'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr
            ? `مرحباً بعودتك، ${user?.fullName ?? ''} — نظرة عامة على المؤسسة والموظفين`
            : `Welcome back, ${user?.fullName ?? ''} — overview of the organization and staff`}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : (
        <>
          <AdminStatCards stats={stats} isAr={isAr} />

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isAr ? 'المهام' : 'Tasks'}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              <TaskStatDropdownCard
                icon={<ListChecks size={22} className="text-blue-600" />}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
                titleAr="مهام PM"
                titleEn="PM Tasks"
                total={pmTaskStats.total}
                byStatus={pmTaskStats.byStatus}
                isAr={isAr}
                isLoading={pmTaskStats.isLoading}
                onSelect={focusPmTasks}
              />
              <TaskStatDropdownCard
                icon={<FolderKanban size={22} className="text-[#709028]" />}
                iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
                titleAr="مهام SEO"
                titleEn="SEO Tasks"
                total={seoTaskStats.total}
                byStatus={seoTaskStats.byStatus}
                isAr={isAr}
                isLoading={seoTaskStats.isLoading}
                onSelect={focusSeoTasks}
              />
            </div>
          </div>

          <MyPermissionsWidget profileRoute={ROUTES.PROFILE} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RoleDistributionCard roles={roleDistribution} isAr={isAr} />
            <DepartmentDistributionCard departments={departmentDistribution} isAr={isAr} />
          </div>

          <RecentActivityCard activity={activity} isAr={isAr} />

          <TasksSection
            ref={pmTasksRef}
            titleAr="مهام PM"
            titleEn="PM Tasks"
            statusOptions={pmTaskStats.byStatus}
            activeStatus={pmTaskStatus}
            onActiveStatusChange={(key) => { setPmTaskStatus(key); setPmTaskPage(1); }}
            activeProject={pmTaskProject}
            onActiveProjectChange={(id) => { setPmTaskProject(id); setPmTaskPage(1); }}
            tasks={pmTaskBriefs.tasks}
            isLoading={pmTaskBriefs.isLoading}
            isAr={isAr}
            pagination={{
              page: pmTaskBriefs.page,
              lastPage: pmTaskBriefs.lastPage,
              total: pmTaskBriefs.total,
              perPage: pmTaskBriefs.perPage,
              onPageChange: setPmTaskPage,
            }}
          />

          <TasksSection
            ref={seoTasksRef}
            titleAr="مهام SEO"
            titleEn="SEO Tasks"
            statusOptions={seoTaskStats.byStatus}
            activeStatus={seoTaskStatus}
            onActiveStatusChange={(key) => { setSeoTaskStatus(key); setSeoTaskPage(1); }}
            activeProject={seoTaskProject}
            onActiveProjectChange={(id) => { setSeoTaskProject(id); setSeoTaskPage(1); }}
            tasks={seoTaskBriefs.tasks}
            isLoading={seoTaskBriefs.isLoading}
            isAr={isAr}
            pagination={{
              page: seoTaskBriefs.page,
              lastPage: seoTaskBriefs.lastPage,
              total: seoTaskBriefs.total,
              perPage: seoTaskBriefs.perPage,
              onPageChange: setSeoTaskPage,
            }}
          />
        </>
      )}

    </div>
  );
}
