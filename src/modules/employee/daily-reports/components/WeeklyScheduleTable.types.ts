import type { WeeklyRow } from '../types/dailyReport.types';

export interface WeeklyScheduleTableProps {
  rows:      WeeklyRow[];
  isLoading: boolean;
  isAr:      boolean;
}
