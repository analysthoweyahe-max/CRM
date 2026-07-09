import type { ApiEmployee } from '../../types/employee.types';

export interface FormValues {
  fullName:       string;
  email:          string;
  phone:          string;
  department:     string;
  jobTitle:       string;
  employmentType: string;
  salary:         string;
  workingHours:   string;
  managerId:      string;
}

export interface EditEmployeeModalProps {
  open:    boolean;
  onClose: () => void;
  emp:     ApiEmployee;
  isAr:    boolean;
}
