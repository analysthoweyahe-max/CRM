import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messages.api';

export function useConversations(params?: { status?: string; search?: string; per_page?: number }) {
  return useQuery({
    queryKey:        ['conversations', params],
    queryFn:         () => messagesApi.listConversations(params).then(r => r.data.data),
    refetchInterval: 30_000,
  });
}

export function useSearchEmployees(search: string) {
  return useQuery({
    queryKey: ['messages', 'employees', search],
    queryFn:  () => messagesApi.searchEmployees({ search, limit: 15 }).then(r => r.data.data),
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
