import { CalendarCheck2, Clock, LogOut, CalendarX2 } from 'lucide-react';
import { useAttendanceStatsCards } from './useAttendanceStatsCards';
import type { AttendanceStatsCardsProps } from './AttendanceStatsCards.types';
import type { ApiEmployeeAttendanceRecord } from '@/modules/hr/attendance/types/attendance.types';

const CARDS = [
  {
    key:    'present',
    ar:     'أيام الحضور',
    en:     'Present Days',
    icon:   CalendarCheck2,
    iconBg: 'bg-[#D8EBAE]',
    iconCl: 'text-[#709028]',
    border: 'border-[#A0CD39]/30',
  },
  {
    key:    'late',
    ar:     'التأخيرات',
    en:     'Late Arrivals',
    icon:   Clock,
    iconBg: 'bg-amber-100',
    iconCl: 'text-amber-600',
    border: 'border-amber-200',
  },
  {
    key:    'earlyOut',
    ar:     'الخروج المبكر',
    en:     'Early Checkouts',
    icon:   LogOut,
    iconBg: 'bg-teal-100',
    iconCl: 'text-teal-600',
    border: 'border-teal-200',
  },
  {
    key:    'absent',
    ar:     'أيام الغياب',
    en:     'Absent Days',
    icon:   CalendarX2,
    iconBg: 'bg-red-100',
    iconCl: 'text-red-500',
    border: 'border-red-200',
  },
] as const;

interface InternalProps {
  records:   ApiEmployeeAttendanceRecord[];
  isLoading: boolean;
  isAr:      boolean;
  activeKey: string | null;
  onFilter:  (key: string | null) => void;
}

export function AttendanceStatsCards({ records, isLoading, isAr, activeKey, onFilter }: InternalProps) {
  const stats = useAttendanceStatsCards(records);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700" />
              <div className="space-y-2 text-end">
                <div className="h-7 w-12 rounded bg-gray-200 dark:bg-gray-600 ms-auto" />
                <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CARDS.map(card => {
        const value    = stats[card.key];
        const Icon     = card.icon;
        const isActive = activeKey === card.key;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilter(isActive ? null : card.key)}
            className={[
              'text-start bg-white dark:bg-gray-800 rounded-2xl border p-5 transition-all',
              'hover:shadow-md hover:-translate-y-0.5',
              isActive ? `${card.border} shadow-md ring-2 ring-offset-1 ring-[#A0CD39]` : 'border-gray-100 dark:border-gray-700',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-3">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={card.iconCl} />
              </div>
              <div className="text-end">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap">
                  {isAr ? card.ar : card.en}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export type { AttendanceStatsCardsProps };
