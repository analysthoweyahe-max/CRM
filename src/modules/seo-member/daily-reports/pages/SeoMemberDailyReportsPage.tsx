import { useState }          from 'react';
import { CalendarDays, Sun, Moon, LayoutGrid } from 'lucide-react';
import { useLang }            from '@/app/providers/LanguageProvider';
import { PageHeader }         from '@/shared/components/ui/PageHeader';
import { StartDayForm }        from '@/modules/employee/daily-reports/components/StartDayForm';
import { EndDayForm }          from '@/modules/employee/daily-reports/components/EndDayForm';
import { WeeklyScheduleTable } from '@/modules/employee/daily-reports/components/WeeklyScheduleTable';
import { DailyReportList }     from '@/modules/employee/daily-reports/components/DailyReportList';
import { useHistory, useWeeklySchedule } from '@/modules/employee/daily-reports/hooks/useDailyReports';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'start-day' | 'end-day' | 'weekly' | 'history';

const TABS = [
  { id: 'start-day' as Tab, arLabel: 'بداية اليوم',     enLabel: 'Start of Day', Icon: Sun          },
  { id: 'end-day'   as Tab, arLabel: 'نهاية اليوم',     enLabel: 'End of Day',   Icon: Moon         },
  { id: 'weekly'    as Tab, arLabel: 'الجدول الأسبوعي', enLabel: 'Weekly',       Icon: LayoutGrid   },
  { id: 'history'   as Tab, arLabel: 'السجل',            enLabel: 'Log',          Icon: CalendarDays },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SeoMemberDailyReportsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const [activeTab, setActiveTab] = useState<Tab>('start-day');

  const { data: history = [], isLoading: histLoading } = useHistory();
  const { data: weekly  = [], isLoading: weekLoading  } = useWeeklySchedule();

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      <PageHeader
        title={isAr ? 'التقارير اليومية' : 'Daily Reports'}
        subtitle={isAr ? 'سجّل بداية ونهاية يومك' : 'Log your day start and end'}
      />

      {/* Tabs */}
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

      {/* Tab content */}
      {activeTab === 'start-day' && <StartDayForm isAr={isAr} />}
      {activeTab === 'end-day'   && <EndDayForm   isAr={isAr} />}
      {activeTab === 'weekly'    && <WeeklyScheduleTable rows={weekly}    isLoading={weekLoading} isAr={isAr} />}
      {activeTab === 'history'   && <DailyReportList    reports={history} isLoading={histLoading} isAr={isAr} />}

    </div>
  );
}
