import { useState } from 'react';
import { CalendarDays, Sun, Moon, LayoutGrid } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { DailyReportList }     from '../components/DailyReportList';
import { StartDayForm }        from '../components/StartDayForm';
import { EndDayForm }          from '../components/EndDayForm';
import { WeeklyScheduleTable } from '../components/WeeklyScheduleTable';
import { useHistory, useWeeklySchedule } from '../hooks/useDailyReports';

type Tab = 'history' | 'start-day' | 'end-day' | 'weekly';

const TABS = [
  { id: 'start-day', arLabel: 'بداية اليوم',     enLabel: 'Start',  Icon: Sun          },
  { id: 'end-day',   arLabel: 'نهاية اليوم',     enLabel: 'End',    Icon: Moon         },
  { id: 'weekly',    arLabel: 'الجدول الأسبوعي', enLabel: 'Weekly', Icon: LayoutGrid   },
  { id: 'history',   arLabel: 'السجل',            enLabel: 'Log',    Icon: CalendarDays },
] as const;

export function EmployeeDailyReportsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<Tab>('start-day');

  const { data: history = [], isLoading: histLoading } = useHistory();
  const { data: weekly  = [], isLoading: weekLoading  } = useWeeklySchedule();

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'التقارير اليومية' : 'Daily Reports'}
        subtitle={isAr ? 'سجّل بداية ونهاية يومك' : 'Log your day start and end'}
      />

      <div className="flex items-center flex-wrap gap-2">
        {TABS.map(({ id, arLabel, enLabel, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
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

      {activeTab === 'start-day' && <StartDayForm isAr={isAr} />}
      {activeTab === 'end-day'   && <EndDayForm isAr={isAr} />}
      {activeTab === 'weekly'    && <WeeklyScheduleTable rows={weekly} isLoading={weekLoading} isAr={isAr} />}
      {activeTab === 'history'   && <DailyReportList reports={history} isLoading={histLoading} isAr={isAr} />}
    </div>
  );
}
