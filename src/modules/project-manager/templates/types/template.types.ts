/* ── PM Project Templates (GET/POST/PUT/DELETE /v1/{pm|seo}/project-templates) ──── */

export interface PmTemplateStep {
  id?:          number;
  title:        string;
  description:  string | null;
  sortOrder:    number;
}

export interface PmTemplateProjectType {
  id:     number;
  name?:  string | null;
  label?: string | null;
  nameAr?: string | null;
  labelAr?: string | null;
}

export interface PmProjectTemplate {
  id:               number;
  uuid:             string;
  name:             string;
  description:      string | null;
  isDefault:        boolean;
  stepsCount:       number;
  steps:            PmTemplateStep[];
  /** Multi type link — preferred. Empty / missing = global (all types). */
  projectTypeIds?:  number[];
  projectTypes?:    PmTemplateProjectType[];
  /** @deprecated Prefer `projectTypeIds` — kept for older API responses. */
  projectTypeId?:   number | null;
  projectType?:     string | null;
  projectTypeLabel?: string | null;
  createdAt:        string;
  updatedAt:        string;
}

export interface PmTemplateStepPayload {
  title:        string;
  description?: string | null;
  sort_order?:  number;
}

export interface PmTemplatePayload {
  name?:            string;
  description?:     string | null;
  is_default?:      boolean;
  /** Linked project type IDs. Empty array = global (available for all types). */
  project_type_ids?: number[];
  steps?:           PmTemplateStepPayload[];
}

export interface PmApplyTemplatePayload {
  template_id: string;
  replace?:    boolean;
}

export interface PmTemplateListApiResponse {
  status:  number | string;
  message: string;
  data: {
    data:         PmProjectTemplate[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface PmTemplateListAllApiResponse {
  status:  number | string;
  message: string;
  data:    PmProjectTemplate[];
}

export interface PmTemplateApiResponse {
  status:  number | string;
  message: string;
  data:    PmProjectTemplate;
}
