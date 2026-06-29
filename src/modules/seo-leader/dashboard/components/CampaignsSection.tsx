import { useState }      from 'react';
import { Plus, Megaphone } from 'lucide-react';
import { Card }           from '@/shared/components/ui/Card';
import { Button }         from '@/shared/components/ui/Button';
import { CampaignCard }   from './CampaignCard';
import type { CampaignViewModel } from '../hooks/useSeoLeaderDashboard';

type TabKey = 'active' | 'pending' | 'completed' | 'paused';

const TABS: { key: TabKey; labelAr: string; labelEn: string }[] = [
  { key: 'active',    labelAr: 'نشطة',   labelEn: 'Active'    },
  { key: 'pending',   labelAr: 'معلقة',  labelEn: 'Pending'   },
  { key: 'completed', labelAr: 'مكتملة', labelEn: 'Completed' },
  { key: 'paused',    labelAr: 'متوقفة', labelEn: 'Paused'    },
];

interface Props {
  campaigns:     CampaignViewModel[];
  isAr:          boolean;
  onNewCampaign: () => void;
}

export function CampaignsSection({ campaigns, isAr, onNewCampaign }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('active');

  const visible = campaigns.filter(c => c.status === activeTab);

  function getCount(key: TabKey) {
    return campaigns.filter(c => c.status === key).length;
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-end px-5 pt-5 pb-0">
        <Button variant="primary" onClick={onNewCampaign} startIcon={<Plus size={16} />}>
          {isAr ? 'حملة جديدة' : 'New Campaign'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-end gap-1 px-5 mt-4 border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto">
        {TABS.map(tab => {
          const count    = getCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium
                          border-b-2 transition-colors duration-150 whitespace-nowrap
                          ${isActive
                            ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
              <span className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold
                                flex items-center justify-center
                                ${isActive
                                  ? 'bg-[#A0CD39] text-gray-900'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="p-5">
        {visible.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'لا توجد حملات في هذه الحالة' : 'No campaigns in this status'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map(c => (
              <CampaignCard key={c.uuid} campaign={c} isAr={isAr} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
