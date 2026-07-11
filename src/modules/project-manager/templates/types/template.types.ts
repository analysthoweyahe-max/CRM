/* ── PM Project Templates (GET/POST/PUT/DELETE /v1/{pm|seo}/project-templates) ──── */

export interface PmTemplateStep {
  id?:          number;
  title:        string;
  description:  string | null;
  sortOrder:    number;
}

export interface PmProjectTemplate {
  id:               number;
  uuid:             string;
  name:             string;
  description:      string | null;
  isDefault:        boolean;
  stepsCount:       number;
  steps:            PmTemplateStep[];
  // Optional type link — present only if the backend associates templates with
  // a project type. Used to filter the template dropdown by the selected type.
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
  // Sent so templates can be scoped per project type (SEO / development / …).
  project_type_id?: number | null;
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
