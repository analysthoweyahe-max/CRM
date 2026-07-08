import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminInstructionsApi } from '../api/instruction.api';
import type { AdminInstructionPayload } from '../types/instruction.types';

const KEY = ['admin', 'instructions'];

export function useInstructionsList() {
  return useQuery({
    queryKey: KEY,
    queryFn:  () => adminInstructionsApi.list({ per_page: 50 }).then((r) => r.data.data),
  });
}

export function useSendInstruction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminInstructionPayload) => adminInstructionsApi.send(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
