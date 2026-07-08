export const Role = {
  Admin:     'admin',
  HR:        'hr',
  Manager:   'manager',
  Employee:  'employee',
  SeoLeader: 'seo-leader',
  SeoMember: 'seo-member',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// Maps every backend role slug (assigned via the admin Roles page) onto the
// portal role the app actually routes/guards by. Without this, an employee who
// is granted e.g. `project-manager` still logs into the plain employee portal.
const ROLE_SLUG_MAP: Record<string, Role> = {
  'super-admin':     'admin',
  admin:             'admin',
  'hr-manager':      'hr',
  hr:                'hr',
  manager:           'manager',
  'project-manager': 'manager',
  'seo-manager':     'seo-leader',
  'seo-leader':      'seo-leader',
  'seo-employee':    'seo-member',
  'seo-member':      'seo-member',
  employee:          'employee',
  'pm-employee':     'employee',
};

// Highest privilege wins when an account carries several roles at once.
const ROLE_PRIORITY: Role[] = ['admin', 'hr', 'manager', 'seo-leader', 'seo-member', 'employee'];

export function mapRolesToAppRole(roles: string[] | undefined, fallback: Role = 'employee'): Role {
  if (roles?.length) {
    const mapped = roles
      .map((slug) => ROLE_SLUG_MAP[slug])
      .filter((role): role is Role => Boolean(role));
    for (const role of ROLE_PRIORITY) {
      if (mapped.includes(role)) return role;
    }
  }
  return fallback;
}

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
