import { useState } from 'react';
import { getAvatarColor } from '@/shared/utils';
import {
  useAdminRequestList,
  useApproveAdminRequest,
  useRejectAdminRequest,
} from '@/shared/modules/admin-requests/hooks/useAdminRequests';
import type { AdminRequest } from '@/shared/modules/admin-requests/types/adminRequest.types';
import type { RequestItem, FilterKey } from '@/shared/modules/team-reports/types/teamReport.types';

function toRequestItem(r: AdminRequest): RequestItem {
  const dateLabel =
    r.startDate && r.endDate && r.startDate !== r.endDate
      ? `${r.startDate} - ${r.endDate}`
      : (r.startDate || r.endDate || r.requestDate || '–');

  return {
    id:            r.id,
    memberName:    r.employee.name,
    memberInitial: r.employee.avatarInitial,
    memberColor:   getAvatarColor(r.employee.name),
    typeAr:        r.requestTypeLabel,
    typeEn:        r.requestTypeLabel,
    bodyAr:        r.description || r.title,
    bodyEn:        r.description || r.title,
    title:         r.title,
    targetDate:    dateLabel,
    submittedDate: r.submittedAt,
    status:        r.status,
    comment:       r.reviewerComment ?? undefined,
    canApprove:    r.actions?.canApprove ?? r.status === 'pending',
    canReject:     r.actions?.canReject  ?? r.status === 'pending',
  };
}

export function useSeoRequests(isAr: boolean, enabled = true) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data, isLoading } = useAdminRequestList(
    'seo',
    {
      status:   filter === 'all' ? undefined : filter,
      per_page: 100,
    },
    enabled,
  );

  const approveMutation = useApproveAdminRequest('seo', isAr);
  const rejectMutation  = useRejectAdminRequest('seo', isAr);

  const visible = (data?.data ?? []).map(toRequestItem);

  return {
    visible,
    filter,
    setFilter,
    isLoading: enabled && isLoading,
    approve: (id: string, comment?: string) => approveMutation.mutate({ id, comment }),
    reject:  (id: string, comment?: string) => rejectMutation.mutate({ id, comment }),
  };
}
