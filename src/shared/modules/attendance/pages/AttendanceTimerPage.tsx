import { useState, useMemo } from 'react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Combobox } from '@/shared/components/form/Combobox';
import { WorkTimerCard } from '../components/WorkTimerCard';
import { AttendanceHistorySection } from '../components/AttendanceHistorySection';
import { resolveAttendanceScope } from '../utils/attendanceTimer.utils';
import type { AttendanceScope } from '../types/attendanceTimer.types';

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthOptions(isAr: boolean) {
  const items: { id: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
    items.push({ id, label });
  }
  return items;
}

interface AttendanceTimerPageProps {
  layoutScope?: AttendanceScope;
  exceptionHref?: string;
}

export function AttendanceTimerPage({ layoutScope, exceptionHref }: AttendanceTimerPageProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { user, can } = useAuth();
  const scope = resolveAttendanceScope(user?.role, user?.section, layoutScope);

  const [month, setMonth] = useState(currentMonth);
  const monthItems = useMemo(() => getMonthOptions(isAr), [isAr]);

  const canViewExceptions = can('view-attendance');
  const resolvedExceptionHref = canViewExceptions ? exceptionHref : undefined;

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'الحضور والانصراف' : 'Attendance'}
        subtitle={isAr ? 'مؤقت يوم العمل وسجل الحضور الشهري' : 'Work timer and monthly attendance log'}
        actions={
          <Combobox
            items={monthItems}
            value={month}
            onChange={setMonth}
            placeholder={isAr ? 'اختر الشهر' : 'Select month'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        }
      />

      <WorkTimerCard
        layoutScope={layoutScope}
        variant="card"
        showExceptionLink={Boolean(resolvedExceptionHref)}
        exceptionHref={resolvedExceptionHref}
      />

      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {isAr ? 'سجل الشهر' : 'Monthly log'}
        </h2>
        <AttendanceHistorySection scope={scope} month={month} />
      </div>
    </div>
  );
}
