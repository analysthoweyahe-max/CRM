import type { EmpLeaveRequest } from '../types/employeeLeave.types';

export interface LeaveRequestsTableProps {
  requests:  EmpLeaveRequest[];
  isLoading: boolean;
  isAr:      boolean;
}
