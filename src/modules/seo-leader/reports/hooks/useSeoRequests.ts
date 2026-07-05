import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAvatarColor } from '@/shared/utils';
import { seoRequestsApi } from '../api/requests.api';
import type { RawSeoRequest } from '../api/requests.api';
import type { RequestItem, FilterKey } from '@/shared/modules/team-reports/types/teamReport.types';

const QUERY_KEY = ['seo-requests'];

function toRequestItem(r: RawSeoRequest): RequestItem {
  return {
    id:            r.id,
    memberName:    r.employee.name,
    memberInitial: r.employee.avatarInitial,
    memberColor:   getAvatarColor(r.employee.name),
    typeAr:        r.requestTypeLabel,
    typeEn:        r.requestTypeLabel,
    bodyAr:        r.description || r.title,
    bodyEn:        r.description || r.title,
    targetDate:    r.startDate === r.endDate ? r.startDate : `${r.startDate} - ${r.endDate}`,
    submittedDate: r.submittedAt,
    status:        r.status,
    comment:       r.reviewerComment ?? undefined,
  };
}

export function useSeoRequests(isAr: boolean) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn:  () => seoRequestsApi.list({ per_page: 100 }).then(r => r.data.data.data.map(toRequestItem)),
  });

  const visible = filter === 'all' ? items : items.filter(r => r.status === filter);

  const approveMutation = useMutation({
    mutationFn: (id: string) => seoRequestsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(isAr ? 'تمت الموافقة على الطلب' : 'Request approved');
    },
    onError: () => toast.error(isAr ? 'تعذّرت الموافقة على الطلب' : 'Failed to approve request'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => seoRequestsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(isAr ? 'تم رفض الطلب' : 'Request rejected');
    },
    onError: () => toast.error(isAr ? 'تعذّر رفض الطلب' : 'Failed to reject request'),
  });

  return {
    visible,
    filter,
    setFilter,
    isLoading,
    approve: (id: string) => approveMutation.mutate(id),
    reject:  (id: string) => rejectMutation.mutate(id),
  };
}
