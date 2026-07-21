export interface ApiSeoProjectStatus {
  id: number;
  label: string;
  labelEn: string;
  labelAr: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  marksCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeoProjectStatusListResponse {
  status: string;
  message: string;
  data: ApiSeoProjectStatus[];
}

export interface SeoProjectStatusSingleResponse {
  status: string;
  message: string;
  data: ApiSeoProjectStatus;
}

export interface CreateSeoProjectStatusPayload {
  label_en: string;
  label_ar: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  marks_completed: boolean;
}

/** PUT body — label/color/flags only (`key` is not sent). */
export interface UpdateSeoProjectStatusPayload {
  label_en: string;
  label_ar: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  marks_completed: boolean;
}

export type UpdateSeoProjectStatusResponse = SeoProjectStatusListResponse;
export type DeleteSeoProjectStatusResponse = SeoProjectStatusListResponse;
