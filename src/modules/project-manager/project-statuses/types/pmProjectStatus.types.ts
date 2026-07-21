export interface ApiPmProjectStatus {
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

export interface PmProjectStatusListResponse {
  status: string;
  message: string;
  data: ApiPmProjectStatus[];
}

export interface PmProjectStatusSingleResponse {
  status: string;
  message: string;
  data: ApiPmProjectStatus;
}

export interface CreatePmProjectStatusPayload {
  label_en: string;
  label_ar: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  marks_completed: boolean;
}

/** PUT body — label/color/flags only (`key` is not sent). */
export interface UpdatePmProjectStatusPayload {
  label_en: string;
  label_ar: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  marks_completed: boolean;
}

export type UpdatePmProjectStatusResponse = PmProjectStatusListResponse;
export type DeletePmProjectStatusResponse = PmProjectStatusListResponse;
