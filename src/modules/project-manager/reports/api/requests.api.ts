import { pmAdminRequestsApi } from '@/shared/modules/admin-requests/api/adminRequest.api';
import type {
  AdminRequest,
  AdminRequestActions,
  AdminRequestEmployee,
  AdminRequestListResponse,
} from '@/shared/modules/admin-requests/types/adminRequest.types';

/** @deprecated Prefer shared AdminRequest types — kept for existing imports */
export type RawPmRequestEmployee = AdminRequestEmployee;
export type RawPmRequestActions  = AdminRequestActions;
export type RawPmRequest         = AdminRequest;
export type PmRequestListResponse = AdminRequestListResponse;

export const pmRequestsApi = pmAdminRequestsApi;
