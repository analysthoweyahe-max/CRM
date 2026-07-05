export interface ApiDepartment {
  id:   number;
  name: string;
}

export interface DepartmentListResponse {
  status:  string;
  message: string;
  data:    ApiDepartment[];
}

export interface DepartmentSingleResponse {
  status:  string;
  message: string;
  data:    ApiDepartment;
}

export interface CreateDepartmentPayload {
  name:  string;
  image: File;
}

export interface DeleteDepartmentResponse {
  status:  string;
  message: string;
}
