import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, FolderKanban, FolderOpenDot, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/shared/components/ui/StatCard';
import { ROUTES } from '@/app/router/routes';
import type { AdminDashboardStats } from '../types/adminDashboard.types';

interface Props {
  stats: AdminDashboardStats;
  isAr:  boolean;
}

interface CardDef {
  key:       string;
  value:     number;
  labelAr:   string;
  labelEn:   string;
  icon:      ComponentType<{ size?: number; className?: string }>;
  iconBg:    string;
  iconColor: string;
  to:        string;
}

function buildPmCards(stats: AdminDashboardStats['pm']): CardDef[] {
  return [
    {
      key: 'dailyReports',
      value: stats.dailyReports,
      labelAr: 'التقارير اليومية',
      labelEn: 'Daily Reports',
      icon: ClipboardList,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      to: ROUTES.PROJECT_MANAGER.REPORTS,
    },
    {
      key: 'teamMembers',
      value: stats.teamMembers,
      labelAr: 'الموظفون النشطون',
      labelEn: 'Active Employees',
      icon: Users,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
      to: ROUTES.PROJECT_MANAGER.TEAM,
    },
    {
      key: 'activeProjects',
      value: stats.activeProjects,
      labelAr: 'المشاريع النشطة',
      labelEn: 'Active Projects',
      icon: FolderOpenDot,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      to: ROUTES.PROJECT_MANAGER.MY_PROJECTS,
    },
  ];
}

function buildSeoCards(stats: AdminDashboardStats['seo']): CardDef[] {
  return [
    {
      key: 'totalProjects',
      value: stats.total_projects,
      labelAr: 'إجمالي المشاريع',
      labelEn: 'Total Projects',
      icon: FolderKanban,
      iconBg: 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20',
      iconColor: 'text-[#709028] dark:text-[#A0CD39]',
      to: ROUTES.SEO_LEADER.MY_PROJECTS,
    },
    {
      key: 'activeEmployees',
      value: stats.active_employees,
      labelAr: 'الموظفين النشطين',
      labelEn: 'Active Employees',
      icon: Users,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
      to: ROUTES.SEO_LEADER.TEAM,
    },
    {
      key: 'completedProjects',
      value: stats.completed_projects,
      labelAr: 'المشاريع المكتملة',
      labelEn: 'Completed Projects',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600',
      to: ROUTES.SEO_LEADER.MY_PROJECTS,
    },
  ];
}

interface GroupProps {
  titleAr: string;
  titleEn: string;
  cards:   CardDef[];
  isAr:    boolean;
  onNavigate: (to: string) => void;
}

function StatCardGroup({ titleAr, titleEn, cards, isAr, onNavigate }: GroupProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {isAr ? titleAr : titleEn}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map(card => (
          <StatCard
            key={card.key}
            value={card.value}
            labelAr={card.labelAr}
            labelEn={card.labelEn}
            iconBg={card.iconBg}
            icon={<card.icon size={22} className={card.iconColor} />}
            isAr={isAr}
            onClick={() => onNavigate(card.to)}
          />
        ))}
      </div>
    </div>
  );
}

export function AdminStatCards({ stats, isAr }: Props) {
  const navigate = useNavigate();

  const pmCards  = buildPmCards(stats.pm);
  const seoCards = buildSeoCards(stats.seo);

  return (
    <div className="space-y-6">
      <StatCardGroup
        titleAr="فريق إدارة المشاريع"
        titleEn="Project Management Team"
        cards={pmCards}
        isAr={isAr}
        onNavigate={navigate}
      />
      <StatCardGroup
        titleAr="فريق السيو"
        titleEn="SEO Team"
        cards={seoCards}
        isAr={isAr}
        onNavigate={navigate}
      />
    </div>
  );
}
