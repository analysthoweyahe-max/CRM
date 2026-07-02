import { ListChecks, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { EmpStatCard } from './EmpStatCard';
import type { EmpTasksOverview } from '../types/dashboard.types';

interface Props {
  overview: EmpTasksOverview;
  pending:  number;
  isAr:     boolean;
}

export function EmpStatCards({ overview, pending, isAr }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <EmpStatCard
        icon={<ListChecks size={20} className="text-blue-600" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        value={overview.totalAssigned}
        labelAr="إجمالي المهام المسندة"
        labelEn="Total Assigned"
        isAr={isAr}
      />
      <EmpStatCard
        icon={<RefreshCw size={20} className="text-amber-600" />}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        value={overview.inProgress}
        labelAr="قيد التنفيذ"
        labelEn="In Progress"
        isAr={isAr}
      />
      <EmpStatCard
        icon={<CheckCircle size={20} className="text-[#709028]" />}
        iconBg="bg-[#D8EBAE] dark:bg-[#A0CD39]/20"
        value={overview.completed}
        labelAr="مكتمل"
        labelEn="Completed"
        isAr={isAr}
      />
      <EmpStatCard
        icon={<Clock size={20} className="text-gray-500" />}
        iconBg="bg-gray-100 dark:bg-gray-700"
        value={pending}
        labelAr="قيد الانتظار"
        labelEn="Pending"
        isAr={isAr}
      />
    </div>
  );
}
