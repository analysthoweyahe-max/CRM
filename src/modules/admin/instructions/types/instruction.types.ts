export type InstructionAudienceType = 'all' | 'department' | 'employee';

export interface AdminInstructionPayload {
  title:         string;
  body:          string;
  audience_type: InstructionAudienceType;
  department_id?: number;
  employee_id?:   string;
}

export interface ApiAdminInstruction {
  id:            string | number;
  title:         string;
  body:          string;
  audienceType:  InstructionAudienceType;
  departmentId?: number | null;
  departmentName?: string | null;
  employeeId?:   string | null;
  employeeName?: string | null;
  createdAt:     string;
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
