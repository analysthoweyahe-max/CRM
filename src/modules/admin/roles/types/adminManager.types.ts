export const MANAGER_ROLE_OPTIONS = [
  { id: 'hr-manager',      labelAr: 'مدير موارد بشرية', labelEn: 'HR Manager'       },
  { id: 'project-manager', labelAr: 'مدير مشاريع',      labelEn: 'Project Manager'  },
  { id: 'seo-manager',     labelAr: 'مدير SEO',         labelEn: 'SEO Manager'      },
] as const;

export interface CreateAdminPayload {
  name:        string;
  email:       string;
  role:        string;
  permissions: string[];
}

export interface CreateAdminResponse {
  status:  string;
  message: string;
}

// ── Managers list (GET /v1/admins) ──────────────────────────────────────────
// Same underlying account model as the confirmed admin-login response
// (ApiAdmin in src/modules/auth/types/auth.types.ts).
export interface ApiAdminManager {
  id:          string;
  name:        string;
  email:       string;
  roles:       string[];
  avatar_url?: string;
  phone?:      string | null;
  status?:     string;
}

export interface AdminManagerListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiAdminManager[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}
