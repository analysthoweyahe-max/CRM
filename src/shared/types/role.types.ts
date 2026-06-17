export const Role = {
  Admin: 'admin',
  HR: 'hr',
  Manager: 'manager',
  Employee: 'employee',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Permission = {
  ViewEmployees: 'view:employees',
  ManageEmployees: 'manage:employees',
  ViewAttendance: 'view:attendance',
  ManageAttendance: 'manage:attendance',
  ViewLeaves: 'view:leaves',
  ManageLeaves: 'manage:leaves',
  ViewPayroll: 'view:payroll',
  ManagePayroll: 'manage:payroll',
  ViewMessages: 'view:messages',
  SendMessages: 'send:messages',
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];
