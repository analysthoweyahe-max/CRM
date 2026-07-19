import { useLang } from '@/app/providers/LanguageProvider';
import { usePermission } from '@/shared/hooks/usePermission';
import { TeamReportsPageShell } from '@/shared/modules/team-reports/components/TeamReportsPageShell';
import { TeamReportsSkeleton } from '@/shared/modules/team-reports/components/TeamReportsSkeleton';
import { DailyReportsTab } from '@/shared/modules/team-reports/components/DailyReportsTab';
import { RequestsTab } from '@/shared/modules/team-reports/components/RequestsTab';
import { useSeoReports } from '../hooks/useSeoReports';
import { useSeoRequests } from '../hooks/useSeoRequests';

export function SeoReportsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const canViewRequests = usePermission('view-requests');
  const canApprove      = usePermission('approve-request');

  const dailyProps    = useSeoReports();
  const requestsProps = useSeoRequests(isAr, canViewRequests);

  if (dailyProps.isLoading || (canViewRequests && requestsProps.isLoading)) {
    return <TeamReportsSkeleton />;
  }

  return (
    <TeamReportsPageShell
      isAr={isAr}
      showRequests={canViewRequests}
      reportsContent={
        <DailyReportsTab
          reports={dailyProps.reports}
          date={dailyProps.date}
          setDate={dailyProps.setDate}
          isEmpty={dailyProps.isEmpty}
          isAr={isAr}
        />
      }
      requestsContent={
        <RequestsTab
          visible={requestsProps.visible}
          filter={requestsProps.filter}
          setFilter={requestsProps.setFilter}
          approve={requestsProps.approve}
          reject={requestsProps.reject}
          canApprove={canApprove}
          isAr={isAr}
        />
      }
    />
  );
}
