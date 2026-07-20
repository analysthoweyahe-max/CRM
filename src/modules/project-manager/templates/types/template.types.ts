/* ── PM / SEO Project Templates (GET/POST/PUT/DELETE /v1/{pm|seo}/project-templates) ──── */

export interface PmTemplateStep {
  id?:          number;
  title:        string;
  description:  string | null;
  sortOrder:    number;
}

export interface PmTemplateProjectType {
  id:      number;
  name:    string;
  label:   string;
  labelAr: string | null;
}

export interface PmProjectTemplate {
  id:               number;
  uuid:             string;
  name:             string;
  /** Optional external URL (docs, drive folder, etc.). */
  link:             string | null;
  description:      string | null;
  isDefault:        boolean;
  stepsCount:       number;
  steps:            PmTemplateStep[];
  /** Source of truth — empty = global (all types). */
  projectTypeIds:   number[];
  projectTypes:     PmTemplateProjectType[];
  /** @deprecated Prefer `projectTypeIds` / `projectTypes`. */
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
  name?:             string;
  link?:             string | null;
  description?:      string | null;
  is_default?:       boolean;
  /** Required. Empty array = global (available for all types). */
  project_type_ids:  number[];
  steps?:            PmTemplateStepPayload[];
}

export interface PmApplyTemplatePayload {
  template_id: string;
  replace?:    boolean;
}

export interface PmTemplateListParams {
  search?:          string;
  per_page?:        number;
  page?:            number;
  project_type_id?: number;
}

export interface PmTemplateAllParams {
  project_type_id?: number;
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
