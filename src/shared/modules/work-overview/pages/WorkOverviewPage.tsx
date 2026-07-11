import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gift, TrendingDown } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Combobox } from '@/shared/components/form/Combobox';
import { WorkOverviewStats } from '../components/WorkOverviewStats';
import { WorkedDaysTable } from '../components/WorkedDaysTable';
import { WorkApiErrorBanner } from '../components/WorkApiErrorBanner';
import { useWorkOverview, useApiQueryError } from '../hooks/useWorkOverview';
import { useWorkScopeContext, type UseWorkScopeOptions } from '../hooks/useWorkScopeContext';
import { currentMonth, getMonthOptions } from '../utils/workOverview.utils';

const linkCls =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors';

export type WorkOverviewPageProps = UseWorkScopeOptions;

export function WorkOverviewPage({ layoutScope, seoRouteVariant }: WorkOverviewPageProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { scope, routes } = useWorkScopeContext({ layoutScope, seoRouteVariant });

  const [month, setMonth] = useState(currentMonth);
  const monthItems = useMemo(() => getMonthOptions(isAr), [isAr]);

  const { data, isLoading, error, isError } = useWorkOverview(scope, month);
  const apiError = useApiQueryError(isError ? error : null);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'نظرة عامة على العمل' : 'Work Overview'}
        subtitle={isAr ? 'حضورك وخصوماتك ومكافآتك لهذا الشهر' : 'Your attendance, deductions, and bonuses for this month'}
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

      {apiError && (
        <WorkApiErrorBanner message={apiError.message} status={apiError.status} isAr={isAr} />
      )}

      {data && <WorkOverviewStats data={data} isAr={isAr} isLoading={isLoading} />}
      {!data && isLoading && <WorkOverviewStats data={placeholderOverview(month)} isAr={isAr} isLoading />}

      <div className="flex flex-wrap gap-2">
        <Link to={routes.attendance} className={linkCls}>
          <Clock size={15} />
          {isAr ? 'سجل الحضور' : 'Attendance history'}
        </Link>
        <Link to={routes.deductions} className={linkCls}>
          <TrendingDown size={15} />
          {isAr ? 'الخصومات' : 'Deductions'}
          {data ? ` (${data.deductions.count})` : ''}
        </Link>
        <Link to={routes.bonuses} className={linkCls}>
          <Gift size={15} />
          {isAr ? 'المكافآت' : 'Bonuses'}
          {data ? ` (${data.bonuses.count})` : ''}
        </Link>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {isAr ? 'أيام العمل' : 'Worked days'}
        </h2>
        <WorkedDaysTable
          days={data?.attendance.workedDays ?? []}
          isAr={isAr}
          isLoading={isLoading && !data}
        />
      </div>
    </div>
  );
}

function placeholderOverview(month: string) {
  return {
    employee: { id: '', name: '', employeeNumber: '' },
    month,
    attendance: {
      month,
      presentDays: 0,
      absentDays: 0,
      lateCount: 0,
      totalWorkHours: 0,
      workedDays: [],
    },
    deductions: { count: 0, totalAmount: 0 },
    bonuses: { count: 0, totalAmount: 0 },
    links: {
      attendanceHistory: '',
      attendanceSummary: '',
      deductions: '',
      bonuses: '',
    },
  };
}
