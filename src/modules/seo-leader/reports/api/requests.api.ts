import { seoAdminRequestsApi } from '@/shared/modules/admin-requests/api/adminRequest.api';
import type {
  AdminRequest,
  AdminRequestActions,
  AdminRequestEmployee,
  AdminRequestListResponse,
} from '@/shared/modules/admin-requests/types/adminRequest.types';

/** @deprecated Prefer shared AdminRequest types — kept for existing imports */
export type RawSeoRequestEmployee = AdminRequestEmployee;
export type RawSeoRequestActions  = AdminRequestActions;
export type RawSeoRequest         = AdminRequest;
export type SeoRequestListResponse = AdminRequestListResponse;

export const seoRequestsApi = seoAdminRequestsApi;
