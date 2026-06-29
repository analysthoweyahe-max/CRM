import type { DayHistoryItem } from '../types/dailyReport.types';

export interface DailyReportsTableProps {
  reports:   DayHistoryItem[];
  isLoading: boolean;
  isAr:      boolean;
}
