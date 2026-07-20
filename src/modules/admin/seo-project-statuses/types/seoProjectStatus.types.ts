export interface ApiSeoProjectStatus {
  id:             number;
  key:            string;
  label:          string;
  labelEn:        string;
  labelAr:        string;
  color:          string | null;
  sortOrder:      number;
  isActive:       boolean;
  isDefault:      boolean;
  marksCompleted: boolean;
  createdAt:      string;
  updatedAt:      string;
}

export interface SeoProjectStatusListResponse {
  status:  string;
  message: string;
  data:    ApiSeoProjectStatus[];
}

export interface SeoProjectStatusSingleResponse {
  status:  string;
  message: string;
  data:    ApiSeoProjectStatus;
}

export interface CreateSeoProjectStatusPayload {
  key:             string;
  label_en:        string;
  label_ar:        string;
  color?:          string;
  sort_order:      number;
  is_active:       boolean;
  marks_completed: boolean;
}

/** PUT body — `key` is not updatable. */
export interface UpdateSeoProjectStatusPayload {
  label_en:        string;
  label_ar:        string;
  color?:          string;
  sort_order:      number;
  is_active:       boolean;
  marks_completed: boolean;
}

export type UpdateSeoProjectStatusResponse = SeoProjectStatusListResponse;
export type DeleteSeoProjectStatusResponse = SeoProjectStatusListResponse;
