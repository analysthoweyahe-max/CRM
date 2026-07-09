export type TabId = 'comments' | 'info' | 'attachments' | 'time';

const TAB_DEFS: { id: TabId; arLabel: string; enLabel: string }[] = [
  { id: 'comments',    arLabel: 'التعليقات',  enLabel: 'Comments'     },
  { id: 'attachments', arLabel: 'المرفقات',   enLabel: 'Attachments'  },
  { id: 'info',        arLabel: 'المعلومات',  enLabel: 'Info'         },
  { id: 'time',        arLabel: 'تتبع الوقت', enLabel: 'Time Tracker' },
];

interface TaskDetailTabsProps {
  activeTab:   TabId;
  onTabChange: (tab: TabId) => void;
  isAr:        boolean;
  counts?:     Partial<Record<TabId, number>>;
}

export function TaskDetailTabs({ activeTab, onTabChange, isAr, counts }: TaskDetailTabsProps) {
  return (
    <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
      {TAB_DEFS.map(tab => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id];
        const label = (isAr ? tab.arLabel : tab.enLabel) + (count != null && count > 0 ? ` (${count})` : '');
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
