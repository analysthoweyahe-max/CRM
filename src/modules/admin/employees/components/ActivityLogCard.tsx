import { Card } from '@/shared/components/ui/Card';
import type { AdminEmployeeActivity } from '../types/adminEmployee.types';

interface Props {
  activity: AdminEmployeeActivity[];
  isAr:     boolean;
}

export function ActivityLogCard({ activity, isAr }: Props) {
  return (
    <Card padding="lg">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
        {isAr ? 'سجل النشاط' : 'Activity Log'}
      </h2>

      {activity.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          {isAr ? 'لا يوجد نشاط بعد' : 'No activity yet'}
        </p>
      ) : (
        <ul className="space-y-4">
          {activity.map(item => (
            <li key={item.id} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A0CD39] mt-1.5 shrink-0" />
              <div className="text-end flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {isAr ? item.titleAr : item.titleEn}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isAr ? item.timeAr : item.timeEn}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
