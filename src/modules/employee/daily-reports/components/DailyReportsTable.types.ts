import type { DailyReportHistoryItem } from '@/shared/modules/daily-reports/types/dailyReport.types';

export interface DailyReportsTableProps {
  reports:   DailyReportHistoryItem[];
  isLoading: boolean;
  isAr:      boolean;
}
