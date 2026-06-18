export const ar = {
  common: {
    save:        'حفظ',
    saving:      'جاري الحفظ...',
    cancel:      'إلغاء',
    back:        'رجوع',
    search:      'بحث',
    noResults:   'لا توجد نتائج',
    viewAll:     'عرض الكل',
    information: 'معلومات',
    active:      'نشط',
  },

  roles: {
    admin:    'مدير النظام',
    hr:       'مدير موارد بشرية',
    manager:  'مدير',
    employee: 'موظف',
  },

  nav: {
    hrSystem: 'نظام الموارد البشرية',
    sections: {
      main:             'القائمة الرئيسية',
      attendanceLeaves: 'الحضور والإجازات',
      communication:    'التواصل',
      system:           'النظام',
    },
    items: {
      dashboard:        'الصفحة الرئيسية',
      employees:        'إدارة الموظفين',
      employeesList:    'الموظفين',
      addEmployee:      'إضافة موظف',
      dailyAttendance:  'الحضور اليومي',
      attendanceLog:    'سجل الحضور',
      leaveManagement:  'إدارة الإجازات',
      payroll:          'الرواتب',
      deductions:       'الخصومات',
      bonuses:          'المكافآت والحوافز',
      messages:         'الرسائل',
      settings:         'الإعدادات',
    },
  },

  topbar: {
    profile:        'الملف الشخصي',
    changeLanguage: 'تغيير اللغة',
    logout:         'تسجيل الخروج',
  },

  dashboard: {
    greeting: 'مرحباً بعودتك، {{name}}',
    subtitle: 'نظرة عامة على أداء الموارد البشرية اليوم',
    stats: {
      totalEmployees:  'إجمالي الموظفين',
      activeEmployees: 'الموظفون النشطون',
      inactive:        'غير النشطين',
      attendanceRate:  'نسبة الحضور',
      pendingLeaves:   'إجازات معلقة',
    },
    recentEmployees: {
      title: 'أحدث الموظفين',
    },
    notifications: {
      title:            'الإشعارات',
      newLeaveRequest:  'طلب إجازة جديد',
      leaveRequestDesc: 'قام أحمد الشريف بطلب إجازة سنوية بانتظار المراجعة',
      newMessage:       'رسالة جديدة',
      messageDesc:      'لديك رسالة جديدة من سارة منصور',
    },
    recentLeaves: {
      title:    'أحدث طلبات الإجازات',
      pending:  'معلقة',
      approved: 'موافق عليها',
      rejected: 'مرفوضة',
    },
    quickActions: {
      messages:        'الرسائل',
      dailyAttendance: 'سجل الحضور اليومي',
      leaveRequests:   'طلبات الإجازات',
      addEmployee:     'إضافة موظف',
    },
    charts: {
      weeklyAttendance:       'نسبة الحضور الأسبوعية',
      last6Days:              'آخر 6 أيام عمل',
      departmentDistribution: 'توزيع الأقسام',
      employeesPerDept:       'عدد الموظفين لكل قسم',
    },
    days: {
      sat: 'السبت',
      sun: 'الأحد',
      mon: 'الإثنين',
      tue: 'الثلاثاء',
      wed: 'الأربعاء',
      thu: 'الخميس',
    },
    departments: {
      marketing:       'التسويق',
      it:              'تقنية المعلومات',
      sales:           'المبيعات',
      hr:              'الموارد البشرية',
      finance:         'المالية',
      customerService: 'خدمة العملاء',
      operations:      'العمليات',
      design:          'التصميم',
    },
  },

  payroll: {
    deductions: {
      title:             'الخصومات',
      subtitle:          'إدارة الخصومات التلقائية واليدوية',
      addButton:         'إضافة خصم',
      searchPlaceholder: 'ابحث باسم الموظف...',
      noResults:         'لا توجد نتائج',
      stats: {
        total:     'إجمالي الخصومات',
        currency:  'ج.م',
        automatic: 'خصومات تلقائية',
        manual:    'خصومات يدويّة',
      },
      columns: {
        employee: 'الموظف',
        type:     'نوع الخصم',
        amount:   'المبلغ',
        reason:   'السبب',
        date:     'التاريخ',
        month:    'الشهر المالي',
        source:   'المصدر',
        auto:     'تلقائي',
        manual:   'يدوي',
      },
      filters: {
        allDepartments: 'كل الأقسام',
        allTypes:       'كل الأنواع',
      },
    },

    addDeduction: {
      title:    'إضافة خصم',
      subtitle: 'تسجيل خصم يدوي على موظف',
      success:  'تم حفظ الخصم بنجاح',
      fields: {
        employee:                  'الموظف',
        employeePlaceholder:       'ابحث عن موظف...',
        employeeSearchPlaceholder: 'ابحث باسم الموظف أو القسم...',
        noResults:                 'لا نتائج',
        date:                      'تاريخ الخصم',
        amount:                    'مبلغ الخصم',
        reason:                    'سبب الخصم',
        reasonPlaceholder:         'مثال: غياب بدون إذن',
        notes:                     'ملاحظات (اختياري)',
        notesPlaceholder:          'تفاصيل إضافية',
      },
      actions: {
        save:   'حفظ الخصم',
        saving: 'جاري الحفظ...',
        cancel: 'إلغاء',
      },
      info: {
        title: 'معلومات',
        items: [
          'يتم إشعار الموظف تلقائياً عند تسجيل الخصم.',
          'يُحفظ سجل تدقيق لكل عملية خصم.',
          'لا يتم حذف الخصومات نهائياً للحفاظ على السجل.',
          'الخصومات التلقائية تُحسب من سجلات الحضور.',
        ],
      },
      validation: {
        employeeRequired: 'يرجى اختيار الموظف',
        dateRequired:     'يرجى تحديد تاريخ الخصم',
        amountRequired:   'يرجى إدخال المبلغ',
        amountPositive:   'يجب أن يكون المبلغ أكبر من صفر',
        reasonRequired:   'يرجى إدخال سبب الخصم (٣ أحرف على الأقل)',
      },
    },
  },

  auth: {
    login: {
      invalidCredentials: 'معرّف المستخدم أو كلمة المرور غير صحيحة',
      signingIn:          'جارٍ تسجيل الدخول...',
    },
    setPassword: {
      error: 'حدث خطأ. حاول مرة أخرى.',
    },
    forgotPassword: {
      title:        'نسيت كلمة المرور؟',
      subtitle:     'أدخل معرف المستخدم وسنرسل لك رابط الاستعادة',
      userIdLabel:  'معرف المستخدم',
      submit:       'إرسال رابط الاستعادة',
      submitting:   'جاري الإرسال...',
      backToLogin:  'العودة لتسجيل الدخول',
    },
  },

  table: {
    showing: 'عرض {{first}}–{{last}} من {{total}}',
  },
};

export type Translations = typeof ar;
