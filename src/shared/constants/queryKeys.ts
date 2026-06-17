export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
  },
  employees: {
    all: ['employees'] as const,
    detail: (id: string) => ['employees', id] as const,
  },
  attendance: {
    byEmployee: (employeeId: string) => ['attendance', employeeId] as const,
  },
  leaves: {
    all: ['leaves'] as const,
    byEmployee: (employeeId: string) => ['leaves', employeeId] as const,
  },
  payroll: {
    deductions: ['payroll', 'deductions'] as const,
    bonuses: ['payroll', 'bonuses'] as const,
  },
};
