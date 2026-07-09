export const MANAGER_ROLE_OPTIONS = [

  { id: 'hr-manager',      labelAr: 'مدير موارد بشرية', labelEn: 'HR Manager'       },

  { id: 'project-manager', labelAr: 'مدير مشاريع',      labelEn: 'Project Manager'  },

  { id: 'seo-manager',     labelAr: 'مدير SEO',         labelEn: 'SEO Manager'      },

] as const;



/** Roles HR managers may assign when creating a manager (no custom permissions). */

export const HR_CREATABLE_MANAGER_ROLES = ['seo-manager', 'project-manager'] as const;



export interface CreateAdminPayload {

  name:         string;

  email:        string;

  role:         string;

  permissions?: string[];

}



export interface UpdateAdminPayload {

  role?:        string;

  permissions?: string[];

}



export type AssignAdminRolePayload = UpdateAdminPayload;



export interface CreateAdminResponse {

  status:  string;

  message: string;

}



export interface ApiAdminManager {

  id:           string;

  name:         string;

  email:        string;

  roles:        string[];

  permissions?: string[];

  roleDetails?: Array<{ name: string; permissions: string[] }>;

  avatar_url?:  string;

  phone?:       string | null;

  status?:      string;

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



export interface AdminManagerDetailResponse {

  status:  string;

  message: string;

  data:    ApiAdminManager;

}


