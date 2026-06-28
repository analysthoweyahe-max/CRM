import { useState, useEffect } from 'react';
import { useLang }           from '@/app/providers/LanguageProvider';
import { DailyReportsTab }   from '../components/DailyReportsTab';
import { RequestsTab }       from '../components/RequestsTab';
import { ProjectReportsSkeleton } from '../components/ProjectReportsSkeleton';

type TabKey = 'reports' | 'requests';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'reports',  ar: 'التقارير اليومية', en: 'Daily Reports' },
  { key: 'requests', ar: 'الطلبات',          en: 'Requests'      },
];

export function ProjectReportsPage() {
  const { lang } = useLang();
  const isAr      = lang === 'ar';

  const [active,    setActive]    = useState<TabKey>('reports');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <ProjectReportsSkeleton />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="text-end space-y-0.5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'التقارير اليومية والطلبات' : 'Daily Reports & Requests'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr ? 'مراجعة ما يقدمه الفريق' : 'Review what the team submits'}
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-2 justify-end">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={[
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              active === t.key
                ? 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20 text-[#709028] dark:text-[#A0CD39]'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#A0CD39]/40',
            ].join(' ')}
          >
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      {/* Content */}
      {active === 'reports'  && <DailyReportsTab isAr={isAr} />}
      {active === 'requests' && <RequestsTab     isAr={isAr} />}
    </div>
  );
}
