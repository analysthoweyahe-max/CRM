import { FolderKanban, Users, ListChecks, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }     from '@/app/providers/LanguageProvider';
import { ROUTES }      from '@/app/router/routes';
import { StatCard }    from '@/shared/components/ui/StatCard';
import { useSeoLeaderDashboard }      from '../hooks/useSeoLeaderDashboard';
import { CampaignsSection }           from '../components/CampaignsSection';
import { SeoLeaderDashboardSkeleton } from '../components/SeoLeaderDashboardSkeleton';

export function SeoLeaderDashboardPage() {
  const { lang }                        = useLang();
  const isAr                            = lang === 'ar';
  const navigate                        = useNavigate();
  const { isLoading, stats, campaigns } = useSeoLeaderDashboard();

  if (isLoading) return <SeoLeaderDashboardSkeleton />;

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderKanban size={22} className="text-[#709028]" />}
          iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
          value={stats?.total_projects ?? 0}
          labelAr="إجمالي المشاريع"
          labelEn="Total Projects"
          isAr={isAr}
        />
        <StatCard
          icon={<Users size={22} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={stats?.active_employees ?? 0}
          labelAr="الموظفين النشطين"
          labelEn="Active Employees"
          isAr={isAr}
          onClick={() => navigate(ROUTES.SEO_LEADER.TEAM)}
        />
        <StatCard
          icon={<ListChecks size={22} className="text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          value={stats?.pending_tasks ?? 0}
          labelAr="المهام المعلقة"
          labelEn="Pending Tasks"
          isAr={isAr}
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          value={stats?.completed_projects ?? 0}
          labelAr="المشاريع المكتملة"
          labelEn="Completed Projects"
          isAr={isAr}
        />
      </div>

      {/* Campaigns list */}
      <CampaignsSection
        campaigns={campaigns}
        isAr={isAr}
        onNewCampaign={() => navigate(ROUTES.SEO_LEADER.NEW)}
      />

    </div>
  );
}
