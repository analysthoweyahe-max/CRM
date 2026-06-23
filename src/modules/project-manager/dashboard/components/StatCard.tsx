import type { ReactElement } from 'react';
import { Card } from '@/shared/components/ui/Card';

export interface StatCardProps {
  icon:    ReactElement;
  iconBg:  string;
  value:   number;
  labelAr: string;
  labelEn: string;
  isAr:    boolean;
}

export function StatCard({ icon, iconBg, value, labelAr, labelEn, isAr }: StatCardProps) {
  return (
    <Card className="px-5 py-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isAr ? labelAr : labelEn}</p>
      </div>
    </Card>
  );
}
