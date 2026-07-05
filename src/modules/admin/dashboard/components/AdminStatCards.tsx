import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, FolderKanban, FolderOpenDot } from 'lucide-react';
import { StatCard } from '@/shared/components/ui/StatCard';
import { ROUTES } from '@/app/router/routes';
import type { AdminDashboardStats } from '../types/adminDashboard.types';

interface Props {
  stats: AdminDashboardStats;
  isAr:  boolean;
}

export function AdminStatCards({ stats, isAr }: Props) {
  const navigate = useNavigate();

  const CARDS = [
    { value: stats.totalEmployees,   labelAr: 'إجمالي الموظفين',   labelEn: 'Total Employees',   icon: Users,          iconBg: 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20', iconColor: 'text-[#709028] dark:text-[#A0CD39]', to: ROUTES.ADMIN.EMPLOYEES },
    { value: stats.activeEmployees,  labelAr: 'الموظفون النشطون', labelEn: 'Active Employees',  icon: UserCheck,      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600', to: ROUTES.ADMIN.EMPLOYEES },
    { value: stats.pendingEmployees, labelAr: 'قيد التفعيل',      labelEn: 'Pending Activation', icon: Clock,      iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600', to: ROUTES.ADMIN.EMPLOYEES },
    { value: stats.activeProjects,   labelAr: 'المشاريع النشطة',  labelEn: 'Active Projects',   icon: FolderOpenDot,  iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600', to: ROUTES.PROJECT_MANAGER.DASHBOARD },
    { value: stats.totalProjects,    labelAr: 'إجمالي المشاريع',  labelEn: 'Total Projects',    icon: FolderKanban,   iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600', to: ROUTES.PROJECT_MANAGER.DASHBOARD },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {CARDS.map(card => (
        <StatCard
          key={card.labelEn}
          value={card.value}
          labelAr={card.labelAr}
          labelEn={card.labelEn}
          iconBg={card.iconBg}
          icon={<card.icon size={22} className={card.iconColor} />}
          isAr={isAr}
          onClick={() => navigate(card.to)}
        />
      ))}
    </div>
  );
}
