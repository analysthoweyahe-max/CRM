export interface ApiPermission {
  id:        number;
  name:      string;
  guardName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionListResponse {
  status:  string;
  message: string;
  data:    ApiPermission[];
}

export interface PermissionSingleResponse {
  status:  string;
  message: string;
  data:    ApiPermission;
}

export interface CreatePermissionPayload {
  name: string;
}

export type UpdatePermissionPayload = CreatePermissionPayload;

// The backend returns the full refreshed permissions list on update/delete instead of a bare ack.
export type UpdatePermissionResponse = PermissionListResponse;
export type DeletePermissionResponse = PermissionListResponse;
