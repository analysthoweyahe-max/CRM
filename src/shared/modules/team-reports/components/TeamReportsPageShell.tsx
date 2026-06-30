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
}

export function TeamReportsPageShell({ isAr, reportsContent, requestsContent }: Props) {
  const [active, setActive] = useState<TabKey>('reports');

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
      {active === 'reports'  && reportsContent}
      {active === 'requests' && requestsContent}
    </div>
  );
}
