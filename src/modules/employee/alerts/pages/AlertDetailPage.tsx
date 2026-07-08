import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Megaphone } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES }  from '@/app/router/routes';
import { Card }    from '@/shared/components/ui/Card';
import { useEmployeeAlertDetail } from '../hooks/useEmployeeAlerts';

export function AlertDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const { lang, isRTL } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { data: alert, isLoading } = useEmployeeAlertDetail(id);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.EMPLOYEE.ALERTS)}
          className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isAr ? 'رجوع' : 'Back'}
        >
          <BackIcon size={18} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'تفاصيل التنبيه' : 'Alert Details'}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : !alert ? (
        <div className="text-center py-16 text-sm text-gray-400">{isAr ? 'التنبيه غير موجود' : 'Alert not found'}</div>
      ) : (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{alert.title}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{alert.createdAt}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {alert.body}
          </p>
        </Card>
      )}
    </div>
  );
}
