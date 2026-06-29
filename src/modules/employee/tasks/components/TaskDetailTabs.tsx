export type TabId = 'comments' | 'info' | 'attachments' | 'time';

const TABS: { id: TabId; arLabel: string; enLabel: string; count?: number }[] = [
  { id: 'comments',    arLabel: 'التعليقات',  enLabel: 'Comments',     count: 2 },
  { id: 'attachments', arLabel: 'المرفقات',   enLabel: 'Attachments',  count: 2 },
  { id: 'info',        arLabel: 'المعلومات',  enLabel: 'Info'                   },
  { id: 'time',        arLabel: 'تتبع الوقت', enLabel: 'Time Tracker'           },
];

interface TaskDetailTabsProps {
  activeTab:   TabId;
  onTabChange: (tab: TabId) => void;
  isAr:        boolean;
}

export function TaskDetailTabs({ activeTab, onTabChange, isAr }: TaskDetailTabsProps) {
  return (
    <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        const label = (isAr ? tab.arLabel : tab.enLabel) + (tab.count ? ` (${tab.count})` : '');
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              'relative px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
            ].join(' ')}
          >
            {label}
            {isActive && (
              <span className="absolute bottom-0 inset-s-0 inset-e-0 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
