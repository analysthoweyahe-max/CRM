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
