import type { Translations } from './ar';

export const en: Translations = {
  common: {
    save:        'Save',
    saving:      'Saving...',
    cancel:      'Cancel',
    back:        'Back',
    search:      'Search',
    noResults:   'No results found',
    viewAll:     'View All',
    information: 'Information',
    active:      'Active',
  },

  roles: {
    admin:    'System Admin',
    hr:       'HR Manager',
    manager:  'Manager',
    employee: 'Employee',
  },

  nav: {
    hrSystem: 'HR System',
    sections: {
      main:             'Main Menu',
      attendanceLeaves: 'Attendance & Leaves',
      communication:    'Communication',
      system:           'System',
    },
    items: {
      dashboard:        'Dashboard',
      employees:        'Employees',
      employeesList:    'Employees',
      addEmployee:      'Add Employee',
      dailyAttendance:  'Daily Attendance',
      attendanceLog:    'Attendance Log',
      leaveManagement:  'Leave Management',
      payroll:          'Payroll',
      deductions:       'Deductions',
      bonuses:          'Bonuses',
      messages:         'Messages',
      settings:         'Settings',
    },
  },

  topbar: {
    profile:        'Profile',
    changeLanguage: 'Change Language',
    logout:         'Logout',
  },

  dashboard: {
    greeting: 'Welcome back, {{name}}',
    subtitle: "Overview of today's HR performance",
    stats: {
      totalEmployees:  'Total Employees',
      activeEmployees: 'Active Employees',
      inactive:        'Inactive',
      attendanceRate:  'Attendance Rate',
      pendingLeaves:   'Pending Leaves',
    },
    recentEmployees: {
      title: 'Recent Employees',
    },
    notifications: {
      title:            'Notifications',
      newLeaveRequest:  'New Leave Request',
      leaveRequestDesc: 'Ahmed requested annual leave — pending review',
      newMessage:       'New Message',
      messageDesc:      'You have a new message from Sara Mansour',
    },
    recentLeaves: {
      title:    'Recent Leave Requests',
      pending:  'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    quickActions: {
      messages:        'Messages',
      dailyAttendance: 'Daily Attendance',
      leaveRequests:   'Leave Requests',
      addEmployee:     'Add Employee',
    },
    charts: {
      weeklyAttendance:       'Weekly Attendance Rate',
      last6Days:              'Last 6 working days',
      departmentDistribution: 'Department Distribution',
      employeesPerDept:       'Employees per department',
    },
    days: {
      sat: 'Sat',
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
    },
    departments: {
      marketing:       'Marketing',
      it:              'IT',
      sales:           'Sales',
      hr:              'HR',
      finance:         'Finance',
      customerService: 'Customer Svc',
      operations:      'Operations',
      design:          'Design',
    },
  },

  payroll: {
    deductions: {
      title:             'Deductions',
      subtitle:          'Manage automatic and manual deductions',
      addButton:         'Add Deduction',
      searchPlaceholder: 'Search employee...',
      noResults:         'No results found',
      stats: {
        total:     'Total Deductions',
        currency:  'EGP',
        automatic: 'Automatic',
        manual:    'Manual',
      },
      columns: {
        employee: 'Employee',
        type:     'Type',
        amount:   'Amount',
        reason:   'Reason',
        date:     'Date',
        month:    'Month',
        source:   'Source',
        auto:     'Auto',
        manual:   'Manual',
      },
      filters: {
        allDepartments: 'All Departments',
        allTypes:       'All Types',
      },
    },

    addDeduction: {
      title:    'Add Deduction',
      subtitle: 'Register a manual deduction for an employee',
      success:  'Deduction saved successfully',
      fields: {
        employee:                  'Employee',
        employeePlaceholder:       'Search for an employee...',
        employeeSearchPlaceholder: 'Search by name or department...',
        noResults:                 'No results',
        date:                      'Deduction Date',
        amount:                    'Deduction Amount',
        reason:                    'Reason',
        reasonPlaceholder:         'e.g. Absence without permission',
        notes:                     'Notes (optional)',
        notesPlaceholder:          'Additional details',
      },
      actions: {
        save:   'Save Deduction',
        saving: 'Saving...',
        cancel: 'Cancel',
      },
      info: {
        title: 'Information',
        items: [
          'The employee is automatically notified when a deduction is registered.',
          'An audit log is saved for every deduction operation.',
          'Deductions are never permanently deleted to preserve the record.',
          'Automatic deductions are calculated from attendance records.',
        ],
      },
      validation: {
        employeeRequired: 'Please select an employee',
        dateRequired:     'Please select a deduction date',
        amountRequired:   'Please enter an amount',
        amountPositive:   'Amount must be greater than zero',
        reasonRequired:   'Please enter a reason (min 3 chars)',
      },
    },
  },

  auth: {
    login: {
      invalidCredentials: 'Invalid employee ID or password',
      signingIn:          'Signing in...',
    },
    setPassword: {
      error: 'Something went wrong. Please try again.',
    },
    forgotPassword: {
      title:       'Forgot Password?',
      subtitle:    "Enter your user ID and we'll send you a recovery link",
      userIdLabel: 'User ID',
      submit:      'Send Recovery Link',
      submitting:  'Sending...',
      backToLogin: 'Back to Login',
    },
  },

  table: {
    showing: 'Showing {{first}}–{{last}} of {{total}}',
  },
};
