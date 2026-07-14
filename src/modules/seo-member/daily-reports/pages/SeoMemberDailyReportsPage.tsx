import { useState } from 'react';
import { CalendarDays, FilePlus2 } from 'lucide-react';
import { useLang }        from '@/app/providers/LanguageProvider';
import { PageHeader }     from '@/shared/components/ui/PageHeader';
import { DailyReportForm } from '../components/DailyReportForm';
import { DailyReportHistoryTable } from '@/shared/modules/daily-reports/components/DailyReportHistoryTable';
import { useHistory }      from '../hooks/useDailyReports';

type Tab = 'submit' | 'history';

const TABS = [
  { id: 'submit'  as Tab, arLabel: 'تقديم تقرير', enLabel: 'Submit Report', Icon: FilePlus2   },
  { id: 'history' as Tab, arLabel: 'السجل',        enLabel: 'Log',          Icon: CalendarDays },
] as const;

export function SeoMemberDailyReportsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [activeTab, setActiveTab] = useState<Tab>('submit');
  const { data: history = [], isLoading: histLoading } = useHistory();

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      <PageHeader
        title={isAr ? 'التقارير اليومية' : 'Daily Reports'}
        subtitle={isAr ? 'قدّم تقريرك اليومي وتابع سجلك' : 'Submit your daily report and track your log'}
      />

      <div className="flex items-center gap-2 flex-wrap">
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
                  ? 'bg-[#A0CD39] text-gray-900'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
              ].join(' ')}
            >
              <Icon size={16} />
              {isAr ? arLabel : enLabel}
            </button>
          );
        })}
      </div>

      {activeTab === 'submit'  && <DailyReportForm isAr={isAr} />}
      {activeTab === 'history' && (
        <DailyReportHistoryTable reports={history} isLoading={histLoading} isAr={isAr} />
      )}

    </div>
  );
}
