import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { messagesApi } from '../api/messages.api';
import type { ApiConversation, ApiEmployeeLookup } from '../types/messages.types';

export function useConversations(params?: { status?: string; search?: string; per_page?: number }) {
  return useQuery({
    queryKey:        ['conversations', params],
    // Defensive: normalize whether the backend returns a flat array or a
    // paginated `{ data: [...] }` wrapper for this endpoint.
    queryFn:         () => messagesApi.listConversations(params).then(r => toApiArray<ApiConversation>(r.data.data)),
    refetchInterval: 30_000,
  });
}

export function useSearchEmployees(search: string) {
  return useQuery({
    queryKey: ['messages', 'employees', search],
    queryFn:  () => messagesApi.searchEmployees({ search, limit: 15 }).then(r => toApiArray<ApiEmployeeLookup>(r.data.data)),
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) =>
      messagesApi.createConversation({ participant_id: participantId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
