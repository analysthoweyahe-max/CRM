import { useNavigate } from 'react-router-dom';
import { Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { ROUTES }     from '@/app/router/routes';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card }       from '@/shared/components/ui/Card';
import { useEmployeeAlertList } from '../hooks/useEmployeeAlerts';

export function EmployeeAlertsPage() {
  const { lang, isRTL } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { data, isLoading } = useEmployeeAlertList();
  const alerts = data?.data ?? [];
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'التنبيهات' : 'Alerts'}
        subtitle={isAr ? 'تعليمات وتنبيهات مرسلة من الإدارة' : 'Instructions and alerts sent by management'}
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
          <Megaphone size={22} className="text-gray-300" />
          {isAr ? 'لا توجد تنبيهات حالياً' : 'No alerts yet'}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              padding="md"
              className="cursor-pointer hover:border-[#A0CD39] transition-colors"
            >
              <button
                type="button"
                onClick={() => navigate(ROUTES.EMPLOYEE.ALERT_DETAIL(alert.id))}
                className="w-full flex items-center justify-between gap-3 text-start"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center
                    ${alert.readAt ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]'}`}>
                    <Megaphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{alert.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{alert.body}</p>
                  </div>
                </div>
                <ChevronIcon size={16} className="text-gray-300 shrink-0" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
