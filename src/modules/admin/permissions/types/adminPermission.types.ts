export interface ApiPermission {
  id:        number;
  name:      string;
  guardName: 'admin' | 'web';
  createdAt: string;
  updatedAt: string;
}

export interface PermissionListResponse {
  status:  string;
  message: string;
  data:    ApiPermission[];
}
