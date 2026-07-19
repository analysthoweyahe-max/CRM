export type InstructionAudienceType = 'all' | 'department' | 'employee' | 'managers';

export interface AdminInstructionPayload {
  title:         string;
  body:          string;
  audience_type: InstructionAudienceType;
  department_id?: number;
  employee_id?:   string;
}

export interface ApiAdminInstruction {
  id:                 string | number;
  title:              string;
  body:               string;
  audienceType:       InstructionAudienceType;
  audienceTypeLabel?: string | null;
  department?:        { id: number; name: string } | null;
  employee?:          { id: string; name: string } | null;
  departmentId?:      number | null;
  departmentName?:    string | null;
  employeeId?:        string | null;
  employeeName?:      string | null;
  recipientsCount?:   number;
  createdAt:          string;
  createdBy?:         { id: string; name: string } | null;
}

export interface AdminInstructionListResponse {
  status:  string;
  message: string;
  data: {
    data:         ApiAdminInstruction[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface AdminInstructionSingleResponse {
  status:  string;
  message: string;
  data:    ApiAdminInstruction;
}
