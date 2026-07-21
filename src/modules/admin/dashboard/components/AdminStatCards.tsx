import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, FolderKanban, FolderOpenDot } from 'lucide-react';
import { StatCard } from '@/shared/components/ui/StatCard';
import { ROUTES } from '@/app/router/routes';
import type { AdminDashboardStats, AdminTeamStats } from '../types/adminDashboard.types';

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

function buildCards(stats: AdminTeamStats, teamRoute: string, projectsRoute: string): CardDef[] {
  return [
    {
      key: 'total',
      value: stats.totalEmployees,
      labelAr: 'إجمالي الموظفين',
      labelEn: 'Total Employees',
      icon: Users,
      iconBg: 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20',
      iconColor: 'text-[#709028] dark:text-[#A0CD39]',
      to: teamRoute,
    },
    {
      key: 'active',
      value: stats.activeEmployees,
      labelAr: 'الموظفون النشطون',
      labelEn: 'Active Employees',
      icon: UserCheck,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600',
      to: teamRoute,
    },
    {
      key: 'inactive',
      value: stats.inactiveEmployees,
      labelAr: 'الموظفون المعطلون',
      labelEn: 'Inactive Employees',
      icon: UserX,
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-600',
      to: teamRoute,
    },
    {
      key: 'activeProjects',
      value: stats.activeProjects,
      labelAr: 'المشاريع النشطة',
      labelEn: 'Active Projects',
      icon: FolderOpenDot,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      to: projectsRoute,
    },
    {
      key: 'totalProjects',
      value: stats.totalProjects,
      labelAr: 'إجمالي المشاريع',
      labelEn: 'Total Projects',
      icon: FolderKanban,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      to: projectsRoute,
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

  const pmCards  = buildCards(stats.pm, ROUTES.PROJECT_MANAGER.TEAM, ROUTES.PROJECT_MANAGER.MY_PROJECTS);
  const seoCards = buildCards(stats.seo, ROUTES.SEO_LEADER.TEAM, ROUTES.SEO_LEADER.MY_PROJECTS);

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
