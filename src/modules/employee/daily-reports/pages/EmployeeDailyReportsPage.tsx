import { useState } from 'react';
import { CalendarDays, FilePlus2, LayoutGrid } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { EmployeeDailyReportForm } from '../components/EmployeeDailyReportForm';
import { WeeklyScheduleTable } from '../components/WeeklyScheduleTable';
import { DailyReportHistoryTable } from '@/shared/modules/daily-reports/components/DailyReportHistoryTable';
import { useHistory, useWeeklySchedule } from '../hooks/useDailyReports';

type Tab = 'submit' | 'history' | 'weekly';

const TABS = [
  { id: 'submit'  as Tab, arLabel: 'تقديم تقرير',     enLabel: 'Submit',  Icon: FilePlus2    },
  { id: 'weekly'  as Tab, arLabel: 'الجدول الأسبوعي', enLabel: 'Weekly',  Icon: LayoutGrid   },
  { id: 'history' as Tab, arLabel: 'السجل',            enLabel: 'Log',     Icon: CalendarDays },
] as const;

export function EmployeeDailyReportsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<Tab>('submit');

  const { data: history = [], isLoading: histLoading } = useHistory();
  const { data: weekly  = [], isLoading: weekLoading  } = useWeeklySchedule();

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'التقارير اليومية' : 'Daily Reports'}
        subtitle={isAr ? 'قدّم تقريرك اليومي وتابع سجلك' : 'Submit your daily report and track your log'}
      />

      <div className="flex items-center flex-wrap gap-2">
        {TABS.map(({ id, arLabel, enLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={[
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-brand-500 text-gray-900'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
              ].join(' ')}
            >
              <Icon size={16} />
              {isAr ? arLabel : enLabel}
            </button>
          );
        })}
      </div>

      {activeTab === 'submit'  && <EmployeeDailyReportForm isAr={isAr} />}
      {activeTab === 'weekly'  && <WeeklyScheduleTable rows={weekly} isLoading={weekLoading} isAr={isAr} />}
      {activeTab === 'history' && (
        <DailyReportHistoryTable reports={history} isLoading={histLoading} isAr={isAr} />
      )}
    </div>
  );
}
