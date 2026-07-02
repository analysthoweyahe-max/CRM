import { Users, UserCheck, ShieldCheck, Briefcase, UserCog, FolderKanban } from 'lucide-react';
import { StatCard } from '@/shared/components/ui/StatCard';
import type { AdminDashboardStats } from '../types/adminDashboard.types';

interface Props {
  stats: AdminDashboardStats;
  isAr:  boolean;
}

export function AdminStatCards({ stats, isAr }: Props) {
  const CARDS = [
    { value: stats.totalEmployees,  labelAr: 'إجمالي الموظفين',   labelEn: 'Total Employees',  icon: Users,       iconBg: 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20', iconColor: 'text-[#709028] dark:text-[#A0CD39]' },
    { value: stats.activeEmployees, labelAr: 'الموظفون النشطون', labelEn: 'Active Employees', icon: UserCheck,   iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
    { value: stats.hrUsers,         labelAr: 'مستخدمو HR',       labelEn: 'HR Users',         icon: ShieldCheck, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
    { value: stats.projectManagers, labelAr: 'مديرو المشاريع',   labelEn: 'Project Managers', icon: Briefcase,   iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { value: stats.employees,       labelAr: 'الموظفون',         labelEn: 'Employees',        icon: UserCog,     iconBg: 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20', iconColor: 'text-[#709028] dark:text-[#A0CD39]' },
    { value: stats.activeProjects,  labelAr: 'المشاريع النشطة',  labelEn: 'Active Projects',  icon: FolderKanban, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {CARDS.map(card => (
        <StatCard
          key={card.labelEn}
          value={card.value}
          labelAr={card.labelAr}
          labelEn={card.labelEn}
          iconBg={card.iconBg}
          icon={<card.icon size={22} className={card.iconColor} />}
          isAr={isAr}
        />
      ))}
    </div>
  );
}
