import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Megaphone } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { myProjectsApi } from '@/shared/modules/my-projects/api/myProjects.api';
import type { StatusLookupItem } from '@/shared/modules/my-projects/types/myProjects.types';
import { CampaignCard } from './CampaignCard';
import type { CampaignViewModel } from '../hooks/useSeoLeaderDashboard';

interface StatusTab {
  key:   string;
  label: string;
}

function tabLabel(item: StatusLookupItem, isAr: boolean): string {
  return isAr ? (item.labelAr ?? item.label) : item.label;
}

interface Props {
  campaigns:     CampaignViewModel[];
  isAr:          boolean;
  onNewCampaign: () => void;
  canCreate?:    boolean;
}

export function CampaignsSection({ campaigns, isAr, onNewCampaign, canCreate = true }: Props) {
  const { data: statusOptions = [], isLoading } = useQuery({
    queryKey:  ['my-projects', 'statuses', 'seo'],
    queryFn:   () => myProjectsApi.getSeoStatuses(),
    staleTime: Infinity,
  });

  const tabs = useMemo<StatusTab[]>(() => {
    const fromApi = statusOptions.map(o => ({
      key:   o.value,
      label: tabLabel(o, isAr),
    }));

    // Keep statuses present on campaigns but missing from the lookup
    // (e.g. client-side "archived") so those projects stay reachable.
    const known = new Set(fromApi.map(t => t.key));
    const extras: StatusTab[] = [];
    for (const c of campaigns) {
      if (!known.has(c.status) && !extras.some(t => t.key === c.status)) {
        extras.push({
          key:   c.status,
          label: c.statusLabel || c.status,
        });
      }
    }

    return [...fromApi, ...extras];
  }, [statusOptions, campaigns, isAr]);

  const defaultKey = tabs.find(t => t.key === 'in_progress')?.key ?? tabs[0]?.key ?? '';
  const [activeTab, setActiveTab] = useState(defaultKey);

  useEffect(() => {
    if (!tabs.length) return;
    if (!tabs.some(t => t.key === activeTab)) {
      setActiveTab(defaultKey);
    }
  }, [tabs, activeTab, defaultKey]);

  const visible = campaigns.filter(c => c.status === activeTab);

  function getCount(key: string) {
    return campaigns.filter(c => c.status === key).length;
  }

  return (
    <Card>
      {canCreate && (
        <div className="flex items-center justify-end px-5 pt-5 pb-0">
          <Button variant="primary" onClick={onNewCampaign} startIcon={<Plus size={16} />}>
            {isAr ? 'مشروع جديد' : 'New Project'}
          </Button>
        </div>
      )}

      <div className="flex items-end gap-1 px-5 mt-4 border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto">
        {isLoading && tabs.length === 0 ? (
          <div className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-700/50 mb-1" />
        ) : (
          tabs.map(tab => {
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
                {tab.label}
                <span className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold
                                  flex items-center justify-center
                                  ${isActive
                                    ? 'bg-[#A0CD39] text-gray-900'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="p-5">
        {visible.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'لا توجد مشاريع في هذه الحالة' : 'No projects in this status'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map(c => (
              <CampaignCard key={c.id} campaign={c} isAr={isAr} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
