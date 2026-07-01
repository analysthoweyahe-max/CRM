import type { SeoLeaveRequest } from '../types/seoLeave.types';

export interface SeoLeaveRequestsTableProps {
  requests:   SeoLeaveRequest[];
  isLoading:  boolean;
  isAr:       boolean;
  onCancel:   (id: string) => void;
  cancelling: string | null;
}
