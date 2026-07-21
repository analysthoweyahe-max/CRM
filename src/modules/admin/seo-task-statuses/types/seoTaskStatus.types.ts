export interface ApiSeoTaskStatus {
  id: number;
  label: string;
  labelEn: string;
  labelAr: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  marksCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeoTaskStatusListResponse {
  status: string;
  message: string;
  data: ApiSeoTaskStatus[];
}

export interface SeoTaskStatusSingleResponse {
  status: string;
  message: string;
  data: ApiSeoTaskStatus;
}

export interface CreateSeoTaskStatusPayload {
  label_en: string;
  label_ar: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  marks_completed: boolean;
}

export type UpdateSeoTaskStatusPayload = CreateSeoTaskStatusPayload;

// The backend returns the full refreshed list on update/delete instead of a bare ack.
export type UpdateSeoTaskStatusResponse = SeoTaskStatusListResponse;
export type DeleteSeoTaskStatusResponse = SeoTaskStatusListResponse;
