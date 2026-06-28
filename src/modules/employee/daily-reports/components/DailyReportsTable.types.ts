import type { DailyReport } from '../types/dailyReport.types';

export interface DailyReportsTableProps {
  reports:   DailyReport[];
  isLoading: boolean;
  isAr:      boolean;
}
