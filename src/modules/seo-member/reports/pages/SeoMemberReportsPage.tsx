import { useState, useMemo }  from 'react';
import { CalendarCheck2, Clock, LogOut, CalendarX2 } from 'lucide-react';
import { useLang }            from '@/app/providers/LanguageProvider';
import { PageHeader }         from '@/shared/components/ui/PageHeader';
import { Combobox }           from '@/shared/components/form/Combobox';
import { AttendanceFilters }  from '@/modules/employee/reports/components/AttendanceFilters';
import { AttendanceHistoryTable } from '@/modules/employee/reports/components/AttendanceHistoryTable';
import { getMonthOptions, currentMonth } from '@/modules/employee/reports/components/useAttendanceFilters';
import { useSeoAttendanceSummary, useSeoAttendanceHistory } from '../hooks/useSeoAttendance';
import type { ApiEmployeeAttendanceRecord } from '@/modules/hr/attendance/types/attendance.types';

// ─── Stat cards config ────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: 'present', ar: 'أيام الحضور',  en: 'Present Days',    icon: CalendarCheck2, iconBg: 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20', iconCl: 'text-[#709028]', border: 'border-[#A0CD39]/30' },
  { key: 'late',    ar: 'التأخيرات',     en: 'Late Arrivals',   icon: Clock,          iconBg: 'bg-amber-100 dark:bg-amber-900/30',  iconCl: 'text-amber-600', border: 'border-amber-200'    },
  { key: 'earlyOut',ar: 'الخروج المبكر', en: 'Early Checkouts', icon: LogOut,         iconBg: 'bg-teal-100 dark:bg-teal-900/30',    iconCl: 'text-teal-600',  border: 'border-teal-200'     },
  { key: 'absent',  ar: 'أيام الغياب',   en: 'Absent Days',     icon: CalendarX2,     iconBg: 'bg-red-100 dark:bg-red-900/30',      iconCl: 'text-red-500',   border: 'border-red-200'      },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SeoMemberReportsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [month,        setMonth]        = useState(currentMonth);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeCard,   setActiveCard]   = useState<string | null>(null);

  const monthItems = useMemo(() => getMonthOptions(isAr), [isAr]);

  const { data: summary,         isLoading: summaryLoading } = useSeoAttendanceSummary(month);
  const { data: allRecords = [], isLoading: historyLoading } = useSeoAttendanceHistory(month);

  const isLoading = summaryLoading || historyLoading;

  const statValues: Record<string, number> = {
    present:  summary?.presentDays     ?? 0,
    late:     summary?.lateCount       ?? 0,
    earlyOut: summary?.earlyLeaveCount ?? 0,
    absent:   summary?.absentDays      ?? 0,
  };

  const activeFilter = activeStatus ?? activeCard;
  const records = useMemo(() => {
    if (!activeFilter) return allRecords;
    if (activeFilter === 'present')  return allRecords.filter(r => r.day_status === 'present' || r.day_status === 'late');
    if (activeFilter === 'earlyOut') return allRecords;
    return allRecords.filter(r => r.day_status === activeFilter);
  }, [allRecords, activeFilter]);

  function handleMonthChange(id: string) {
    setMonth(id);
    setActiveStatus(null);
    setActiveCard(null);
  }

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      <PageHeader
        title={isAr ? 'سجل الحضور' : 'Attendance'}
        subtitle={isAr ? 'سجل حضورك وانصرافك الشهري' : 'Your monthly attendance record'}
        actions={
          <Combobox
            items={monthItems}
            value={month}
            onChange={handleMonthChange}
            placeholder={isAr ? 'اختر الشهر' : 'Select month'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        }
      />

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map(card => {
            const Icon     = card.icon;
            const isActive = activeCard === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => { setActiveCard(isActive ? null : card.key); setActiveStatus(null); }}
                className={[
                  'text-start bg-white dark:bg-gray-800 rounded-2xl border p-5 transition-all',
                  'hover:shadow-md hover:-translate-y-0.5',
                  isActive
                    ? `${card.border} shadow-md ring-2 ring-offset-1 ring-[#A0CD39]`
                    : 'border-gray-100 dark:border-gray-700',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={card.iconCl} />
                  </div>
                  <div className="text-end">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">
                      {statValues[card.key]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap">
                      {isAr ? card.ar : card.en}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter chips */}
      <AttendanceFilters
        activeStatus={activeStatus}
        onStatusChange={s => { setActiveStatus(s); setActiveCard(null); }}
        isAr={isAr}
      />

      {/* History table */}
      <AttendanceHistoryTable
        records={records as ApiEmployeeAttendanceRecord[]}
        isLoading={isLoading}
        isAr={isAr}
      />

    </div>
  );
}
