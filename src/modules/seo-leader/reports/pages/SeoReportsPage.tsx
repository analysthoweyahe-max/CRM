import { useEffect, useState }   from 'react';
import { useLang }               from '@/app/providers/LanguageProvider';
import { TeamReportsPageShell }  from '@/shared/modules/team-reports/components/TeamReportsPageShell';
import { TeamReportsSkeleton }   from '@/shared/modules/team-reports/components/TeamReportsSkeleton';
import { DailyReportsTab }       from '@/shared/modules/team-reports/components/DailyReportsTab';
import { RequestsTab }           from '@/shared/modules/team-reports/components/RequestsTab';
import { useSeoReports }         from '../hooks/useSeoReports';
import { useSeoRequests }        from '../hooks/useSeoRequests';

export function SeoReportsPage() {
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const dailyProps    = useSeoReports();
  const requestsProps = useSeoRequests(isAr);

  if (loading) return <TeamReportsSkeleton />;

  return (
    <TeamReportsPageShell
      isAr={isAr}
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
          isAr={isAr}
        />
      }
    />
  );
}
