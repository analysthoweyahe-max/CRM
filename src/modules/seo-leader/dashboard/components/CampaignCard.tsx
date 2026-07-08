import { useNavigate }     from 'react-router-dom';
import { CalendarDays }    from 'lucide-react';
import { Card }            from '@/shared/components/ui/Card';
import { Button }          from '@/shared/components/ui/Button';
import { formatDateShort } from '@/shared/utils/date.utils';
import { ROUTES }          from '@/app/router/routes';
import type { CampaignViewModel } from '../hooks/useSeoLeaderDashboard';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';

const STATUS_BADGE: Record<string, { dot: string; badge: string }> = {
  in_progress: { dot: 'bg-[#A0CD39]',    badge: 'bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]'              },
  not_started: { dot: 'bg-amber-500',     badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'               },
  completed:   { dot: 'bg-emerald-500',   badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'        },
  paused:      { dot: 'bg-gray-400',      badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'                      },
  draft:       { dot: 'bg-blue-400',      badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'                   },
};

const FALLBACK = { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' };

interface Props {
  campaign: CampaignViewModel;
  isAr:     boolean;
}

export function CampaignCard({ campaign, isAr }: Props) {
  const navigate = useNavigate();
  const cfg      = STATUS_BADGE[campaign.status] ?? FALLBACK;

  return (
    <Card className="p-5 flex flex-col gap-4 transition-all duration-200 hover:border-[#A0CD39] hover:shadow-lg">

      {/* Title + type badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug truncate">
            {campaign.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {campaign.description}
          </p>
        </div>
        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full border
                         border-gray-200 dark:border-gray-600
                         text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {translateProjectLookup(campaign.campaignType, campaign.campaignTypeLabel, isAr)}
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <CalendarDays size={13} className="shrink-0" />
        <span>{formatDateShort(campaign.startDate, isAr)}</span>
        <span className="text-gray-300 dark:text-gray-600">→</span>
        <span>{campaign.expectedEndDate ? formatDateShort(campaign.expectedEndDate, isAr) : '—'}</span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{isAr ? 'نسبة الإنجاز' : 'Progress'}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{campaign.progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
            style={{ width: `${campaign.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isAr ? 'المهام:' : 'Tasks:'}
            <span className="ms-1 font-semibold text-gray-800 dark:text-gray-100">
              {campaign.tasks_completed}/{campaign.tasks_total}
            </span>
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {translateProjectLookup(campaign.status, campaign.statusLabel, isAr)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Button
        variant="secondary"
        fullWidth
        onClick={() => navigate(ROUTES.SEO_LEADER.DETAILS(String(campaign.id)))}
        className="hover:border-[#A0CD39] hover:text-[#709028] dark:hover:text-[#A0CD39]"
      >
        {isAr ? 'تفاصيل المشروع' : 'View Details'}
      </Button>
    </Card>
  );
}
