import { http } from '@/shared/services/http.service';
import type {
  AdminInstructionPayload,
  AdminInstructionListResponse,
  AdminInstructionSingleResponse,
} from '../types/instruction.types';

export const adminInstructionsApi = {
  list(params: { per_page?: number; page?: number } = {}) {
    return http.get<AdminInstructionListResponse>('/v1/admin/instructions', { params });
  },

  send(payload: AdminInstructionPayload) {
    return http.post<AdminInstructionSingleResponse>('/v1/admin/instructions', payload);
  },
};
