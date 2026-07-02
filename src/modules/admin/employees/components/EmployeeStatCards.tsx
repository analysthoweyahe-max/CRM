import { FolderKanban, ListChecks, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from '@/shared/components/ui/StatCard';
import type { AdminEmployeeStats } from '../types/adminEmployee.types';

interface Props {
  stats: AdminEmployeeStats;
  isAr:  boolean;
}

export function EmployeeStatCards({ stats, isAr }: Props) {
  const CARDS = [
    { value: stats.projects,       labelAr: 'المشاريع',        labelEn: 'Projects',        icon: FolderKanban, iconBg: 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20', iconColor: 'text-[#709028] dark:text-[#A0CD39]' },
    { value: stats.tasksAssigned,  labelAr: 'المهام المسندة',  labelEn: 'Assigned Tasks',  icon: ListChecks,   iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { value: stats.totalHours,     labelAr: 'إجمالي الساعات',  labelEn: 'Total Hours',     icon: Clock,        iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
    { value: `${stats.completionRate}%`, labelAr: 'معدل الإنجاز', labelEn: 'Completion Rate', icon: TrendingUp, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
