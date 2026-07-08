export interface ApiEmployeeAlert {
  id:        string | number;
  title:     string;
  body:      string;
  type:      string;
  readAt:    string | null;
  createdAt: string;
}

export interface EmployeeAlertListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiEmployeeAlert[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface EmployeeAlertSingleResponse {
  status:  string;
  message: string;
  data:    ApiEmployeeAlert;
}
