import type { EmpLeaveSummaryItem } from '../types/employeeLeave.types';

export interface LeaveBalancePanelProps {
  summary:   EmpLeaveSummaryItem[];
  isLoading: boolean;
  isAr:      boolean;
}
