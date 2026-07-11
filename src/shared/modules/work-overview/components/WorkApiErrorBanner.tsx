import { AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';

interface WorkApiErrorBannerProps {
  message: string;
  isAr: boolean;
  status?: number;
}

export function WorkApiErrorBanner({ message, isAr, status }: WorkApiErrorBannerProps) {
  const title = status === 422
    ? (isAr ? 'تعذر تحميل البيانات' : 'Unable to load data')
    : (isAr ? 'حدث خطأ' : 'Something went wrong');

  return (
    <Card className="px-4 py-4 border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{title}</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{message}</p>
        </div>
      </div>
    </Card>
  );
}
