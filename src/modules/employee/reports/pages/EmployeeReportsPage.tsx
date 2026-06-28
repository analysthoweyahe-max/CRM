import { useState, useMemo } from 'react';
import { useQuery }      from '@tanstack/react-query';
import { useLang }       from '@/app/providers/LanguageProvider';
import { PageHeader }    from '@/shared/components/ui/PageHeader';
import { Combobox }      from '@/shared/components/form/Combobox';
import { attendanceApi } from '@/modules/hr/attendance/api/attendance.api';
import { currentMonth, getMonthOptions } from '../components/useAttendanceFilters';
import { AttendanceStatsCards }   from '../components/AttendanceStatsCards';
import { AttendanceFilters }      from '../components/AttendanceFilters';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';

export function EmployeeReportsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const [month,        setMonth]        = useState(currentMonth);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeCard,   setActiveCard]   = useState<string | null>(null);

  const monthItems = useMemo(() => getMonthOptions(isAr), [isAr]);

  const { data, isLoading } = useQuery({
    queryKey: ['employee', 'reports', 'history', month],
    queryFn:  () => attendanceApi.employeeSelfHistory({ month, per_page: 31 }),
    select:   res => res.data.data?.data ?? [],
  });

  const allRecords = data ?? [];

  const activeFilter = activeStatus ?? activeCard;
  const records = useMemo(() => {
    if (!activeFilter) return allRecords;
    if (activeFilter === 'present') return allRecords.filter(r => r.day_status === 'present' || r.day_status === 'late');
    return allRecords.filter(r => r.day_status === activeFilter);
  }, [allRecords, activeFilter]);

  function handleMonthChange(id: string) {
    setMonth(id);
    setActiveStatus(null);
    setActiveCard(null);
  }

  function handleStatusChange(s: string | null) {
    setActiveStatus(s);
    setActiveCard(null);
  }

  function handleCardFilter(key: string | null) {
    setActiveCard(key);
    setActiveStatus(null);
  }

  return (
    <div className="space-y-5">
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

      <AttendanceStatsCards
        records={allRecords}
        isLoading={isLoading}
        isAr={isAr}
        activeKey={activeCard}
        onFilter={handleCardFilter}
      />

      <AttendanceFilters
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        isAr={isAr}
      />

      <AttendanceHistoryTable
        records={records}
        isLoading={isLoading}
        isAr={isAr}
      />
    </div>
  );
}
