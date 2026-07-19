import { useState, type ReactNode } from 'react';

type TabKey = 'reports' | 'requests';

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: 'reports',  ar: 'التقارير اليومية', en: 'Daily Reports' },
  { key: 'requests', ar: 'الطلبات',           en: 'Requests'      },
];

interface Props {
  isAr:            boolean;
  reportsContent:  ReactNode;
  requestsContent: ReactNode;
  /** Hide the Requests tab when the user lacks view-requests. */
  showRequests?:   boolean;
}

export function TeamReportsPageShell({
  isAr,
  reportsContent,
  requestsContent,
  showRequests = true,
}: Props) {
  const [active, setActive] = useState<TabKey>('reports');
  const tabs = showRequests ? TABS : TABS.filter((t) => t.key === 'reports');
  const effective = !showRequests && active === 'requests' ? 'reports' : active;

  return (
    <div className="space-y-5">
      <div className="text-end space-y-0.5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr
            ? (showRequests ? 'التقارير اليومية والطلبات' : 'التقارير اليومية')
            : (showRequests ? 'Daily Reports & Requests' : 'Daily Reports')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr ? 'مراجعة ما يقدمه الفريق' : 'Review what the team submits'}
        </p>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={[
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              effective === t.key
                ? 'bg-[#D8EBAE] dark:bg-[#A0CD39]/20 text-[#709028] dark:text-[#A0CD39]'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#A0CD39]/40',
            ].join(' ')}
          >
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      {effective === 'reports' && reportsContent}
      {effective === 'requests' && showRequests && requestsContent}
    </div>
  );
}
