import { Card } from '@/shared/components/ui/Card';
import type { ActivityItem, ActivityType } from '../types/adminDashboard.types';

const DOT_COLOR: Record<ActivityType, string> = {
  create:     'bg-emerald-500',
  update:     'bg-blue-500',
  permission: 'bg-amber-500',
  delete:     'bg-red-500',
};

interface Props {
  activity: ActivityItem[];
  isAr:     boolean;
}

export function RecentActivityCard({ activity, isAr }: Props) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-end mb-2">
        {isAr ? 'آخر النشاطات' : 'Recent Activities'}
      </h3>

      {activity.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          {isAr ? 'لا يوجد نشاط بعد' : 'No activity yet'}
        </p>
      ) : (
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {activity.map(item => (
          <div key={item.id} className="flex items-start justify-between gap-4 py-3.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 pt-1">
              {isAr ? item.timeAr : item.timeEn}
            </span>
            <div className="flex items-start gap-2.5 text-end">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {isAr ? item.titleAr : item.titleEn}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isAr ? item.descriptionAr : item.descriptionEn}
                </p>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${DOT_COLOR[item.type]}`} />
            </div>
          </div>
        ))}
      </div>
      )}
    </Card>
  );
}
