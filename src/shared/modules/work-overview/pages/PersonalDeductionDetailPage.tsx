import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { WorkApiErrorBanner } from '../components/WorkApiErrorBanner';
import { usePersonalDeduction, useApiQueryError } from '../hooks/useWorkOverview';
import { useWorkScopeContext, type UseWorkScopeOptions } from '../hooks/useWorkScopeContext';
import { formatMoney } from '../utils/workOverview.utils';

export type PersonalDeductionDetailPageProps = UseWorkScopeOptions;

export function PersonalDeductionDetailPage({ layoutScope, seoRouteVariant }: PersonalDeductionDetailPageProps) {
  const { id = '' } = useParams<{ id: string }>();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const { scope, routes } = useWorkScopeContext({ layoutScope, seoRouteVariant });

  const { data, isLoading, error, isError } = usePersonalDeduction(scope, id);
  const apiError = useApiQueryError(isError ? error : null);

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'تفاصيل الخصم' : 'Deduction details'}
        subtitle={data?.type?.label || data?.deductionTypeLabel || data?.sourceLabel || undefined}
        actions={
          <Link
            to={routes.deductions}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#709028]"
          >
            <ArrowRight size={14} className={isAr ? '' : 'rotate-180'} />
            {isAr ? 'العودة للخصومات' : 'Back to deductions'}
          </Link>
        }
      />

      {apiError && (
        <WorkApiErrorBanner message={apiError.message} status={apiError.status} isAr={isAr} />
      )}

      {isLoading && !data ? (
        <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ) : data ? (
        <Card className="p-5 space-y-4">
          <DetailRow label={isAr ? 'المبلغ' : 'Amount'} value={formatMoney(data.amount, isAr)} valueClass="text-red-600 dark:text-red-400 font-bold text-lg" />
          <DetailRow label={isAr ? 'النوع' : 'Type'} value={data.type?.label || data.deductionTypeLabel || '—'} />
          <DetailRow label={isAr ? 'المصدر' : 'Source'} value={data.sourceLabel || '—'} />
          <DetailRow label={isAr ? 'السبب' : 'Reason'} value={data.reason || '—'} />
          <DetailRow label={isAr ? 'تاريخ الخصم' : 'Deduction date'} value={data.deductionDate || '—'} />
          <DetailRow label={isAr ? 'الشهر المالي' : 'Financial month'} value={data.financialMonth || '—'} />
          <DetailRow label={isAr ? 'الحالة' : 'Status'} value={data.statusLabel || data.status || '—'} />
          {data.notes ? <DetailRow label={isAr ? 'ملاحظات' : 'Notes'} value={data.notes} /> : null}
        </Card>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClass = 'text-gray-800 dark:text-gray-100',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:w-40 shrink-0">{label}</dt>
      <dd className={`text-sm ${valueClass}`}>{value}</dd>
    </div>
  );
}
