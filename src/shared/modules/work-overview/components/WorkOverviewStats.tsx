import type { ReactElement } from 'react';
import {
  CalendarCheck2,
  CalendarX2,
  Clock,
  Gift,
  Timer,
  TrendingDown,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { formatMoney, formatWorkHours } from '../utils/workOverview.utils';
import type { WorkOverviewData } from '../types/workOverview.types';

interface WorkOverviewStatsProps {
  data: WorkOverviewData;
  isAr: boolean;
  isLoading?: boolean;
}

interface StatDef {
  key: string;
  labelAr: string;
  labelEn: string;
  value: string;
  icon: ReactElement;
  iconBg: string;
  valueClass?: string;
}

export function WorkOverviewStats({ data, isAr, isLoading }: WorkOverviewStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const att = data.attendance;
  const stats: StatDef[] = [
    {
      key: 'present',
      labelAr: 'أيام الحضور',
      labelEn: 'Present days',
      value: String(att.presentDays),
      icon: <CalendarCheck2 size={18} className="text-[#709028]" />,
      iconBg: 'bg-[#D8EBAE]/60 dark:bg-[#A0CD39]/15',
    },
    {
      key: 'absent',
      labelAr: 'أيام الغياب',
      labelEn: 'Absent days',
      value: String(att.absentDays),
      icon: <CalendarX2 size={18} className="text-red-500" />,
      iconBg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      key: 'late',
      labelAr: 'التأخيرات',
      labelEn: 'Late count',
      value: String(att.lateCount),
      icon: <Clock size={18} className="text-amber-600" />,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      key: 'hours',
      labelAr: 'ساعات العمل',
      labelEn: 'Total work hours',
      value: formatWorkHours(att.totalWorkHours),
      icon: <Timer size={18} className="text-teal-600" />,
      iconBg: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      key: 'deductions',
      labelAr: 'إجمالي الخصومات',
      labelEn: 'Deductions total',
      value: formatMoney(data.deductions.totalAmount, isAr),
      icon: <TrendingDown size={18} className="text-red-500" />,
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      valueClass: 'text-red-600 dark:text-red-400',
    },
    {
      key: 'bonuses',
      labelAr: 'إجمالي المكافآت',
      labelEn: 'Bonuses total',
      value: formatMoney(data.bonuses.totalAmount, isAr),
      icon: <Gift size={18} className="text-[#709028]" />,
      iconBg: 'bg-[#D8EBAE]/60 dark:bg-[#A0CD39]/15',
      valueClass: 'text-[#709028] dark:text-[#A0CD39]',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((s) => (
        <Card key={s.key} className="px-4 py-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
            {s.icon}
          </div>
          <div className="min-w-0">
            <p className={`text-lg font-bold tabular-nums truncate ${s.valueClass ?? 'text-gray-900 dark:text-gray-100'}`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {isAr ? s.labelAr : s.labelEn}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
