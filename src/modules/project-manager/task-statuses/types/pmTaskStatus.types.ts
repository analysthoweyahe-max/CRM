export interface ApiPmTaskStatus {
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

export interface PmTaskStatusListResponse {
  status: string;
  message: string;
  data: ApiPmTaskStatus[];
}

export interface PmTaskStatusSingleResponse {
  status: string;
  message: string;
  data: ApiPmTaskStatus;
}

export interface CreatePmTaskStatusPayload {
  label_en: string;
  label_ar: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  marks_completed: boolean;
}

export type UpdatePmTaskStatusPayload = CreatePmTaskStatusPayload;

export type UpdatePmTaskStatusResponse = PmTaskStatusListResponse;
export type DeletePmTaskStatusResponse = PmTaskStatusListResponse;
