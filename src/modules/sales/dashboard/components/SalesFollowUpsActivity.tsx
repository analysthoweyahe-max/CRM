import { Activity } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Badge, type BadgeVariant } from '@/shared/components/ui/Badge';
import type { SalesFollowUp, SalesActivityItem } from '../hooks/useSalesDashboardMock';

interface Props {
  isAr:      boolean;
  followUps: SalesFollowUp[];
  activity:  SalesActivityItem[];
}

const PRIORITY_VARIANT: Record<SalesFollowUp['priority'], BadgeVariant> = {
  urgent: 'error',
  high:   'warning',
  medium: 'gray',
};

const PRIORITY_LABEL: Record<SalesFollowUp['priority'], { ar: string; en: string }> = {
  urgent: { ar: 'عاجلة',   en: 'Urgent' },
  high:   { ar: 'عالية',   en: 'High' },
  medium: { ar: 'متوسطة',  en: 'Medium' },
};

export function SalesFollowUpsActivity({ isAr, followUps, activity }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

      {/* Upcoming follow-ups */}
      <Card overflow className="fade-in-up">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isAr ? 'المتابعات القادمة' : 'Upcoming Follow-ups'}
          </h3>
          {followUps.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400
                             font-bold px-2 py-0.5 rounded-full">
              {followUps.length} {isAr ? 'اليوم' : 'today'}
            </span>
          )}
        </div>
        <ul className="divide-y divide-gray-50 dark:divide-gray-700/40">
          {followUps.length === 0 ? (
            <li className="px-5 py-6 text-center text-xs text-gray-400">
              {isAr ? 'لا توجد متابعات' : 'No follow-ups'}
            </li>
          ) : followUps.map(f => {
            const Icon = f.icon;
            return (
              <li key={f.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-gray-500 dark:text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {isAr ? f.whenAr : f.whenEn}
                  </p>
                </div>
                <Badge
                  label={isAr ? PRIORITY_LABEL[f.priority].ar : PRIORITY_LABEL[f.priority].en}
                  variant={PRIORITY_VARIANT[f.priority]}
                />
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Recent activity */}
      <Card overflow className="fade-in-up">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isAr ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
        </div>
        <ul className="divide-y divide-gray-50 dark:divide-gray-700/40">
          {activity.length === 0 ? (
            <li className="px-5 py-6 text-center text-xs text-gray-400">
              {isAr ? 'لا يوجد نشاط' : 'No activity'}
            </li>
          ) : activity.map(a => (
            <li key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 mt-0.5">
                <Activity size={13} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">{isAr ? a.textAr : a.textEn}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{isAr ? a.agoAr : a.agoEn}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
