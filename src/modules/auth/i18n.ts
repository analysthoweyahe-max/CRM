export type AuthLang = 'ar' | 'en';

export const authTranslations = {
  ar: {
    langToggle: 'English',

    branding: {
      companyName: 'هوية',
      systemName:  'نظام الموارد البشرية',
      headline:    'إدارة موظفيك بكفاءة وسهولة',
      description: 'منصة متكاملة لإدارة الموارد البشرية، الرواتب، الحضور والإجازات في مكان واحد.',
      features: [
        'إدارة بيانات الموظفين',
        'تتبع الحضور والانصراف',
        'إدارة الإجازات والغيابات',
        'معالجة الرواتب والمكافآت',
      ],
      copyright: '© 2026 هوية — جميع الحقوق محفوظة',
    },

    login: {
      title:                 'تسجيل الدخول',
      subtitle:              'أدخل بياناتك للوصول إلى لوحة التحكم',
      employeeId:            'البريد الإلكتروني / معرّف المدير',
      employeeIdPlaceholder: 'بريدك الإلكتروني أو UUID الخاص بك',
      password:              'كلمة المرور',
      passwordPlaceholder:   '••••••••••••••',
      forgotPassword:        'نسيت كلمة المرور؟',
      rememberMe:            'تذكرني',
      submit:                'تسجيل الدخول',
      activationPrompt:      'موظف جديد؟',
      activationAction:      'تفعيل الحساب',
      activatedSuccess:      'تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول.',
    },

    setPassword: {
      title:           'تعيين كلمة المرور',
      subtitle:        'أنشئ كلمة مرور قوية لتفعيل حسابك',
      password:        'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword:  'نسيت كلمة المرور؟',
      rememberMe:      'تذكرني',
      submit:          'تفعيل الحساب',
      activating:      'جارٍ التفعيل...',
    },

    invite: {
      validating:   'جارٍ التحقق من الدعوة...',
      expiredTitle: 'رابط الدعوة منتهي الصلاحية',
      expiredDesc:  'انتهت صلاحية هذا الرابط أو تم استخدامه مسبقاً. تواصل مع مسؤول النظام للحصول على رابط جديد.',
      greeting:     'مرحباً',
      accountEmail: 'البريد الإلكتروني',
    },

    magicLink: {
      checkEmailTitle:  'افحص بريدك الإلكتروني',
      checkEmailDesc:   'أرسلنا رابط تسجيل دخول آمن إلى بريدك الإلكتروني. اضغط عليه لإكمال تسجيل الدخول.',
      expiresLabel:     'ينتهي الرابط في',
      backToLogin:      'العودة لتسجيل الدخول',
      verifying:        'جارٍ التحقق من الرابط...',
      invalidTitle:     'رابط الدخول غير صالح',
      invalidDesc:      'انتهت صلاحية هذا الرابط أو تم استخدامه من قبل. حاول تسجيل الدخول مرة أخرى.',
    },

    otp: {
      title:        'رمز التحقق',
      subtitle:     'أرسلنا رمز تحقق مكوّن من 6 أرقام إلى بريدك الإلكتروني. أدخله لإكمال تسجيل الدخول.',
      codeLabel:    'رمز التحقق',
      placeholder:  '______',
      submit:       'تأكيد وتسجيل الدخول',
      verifying:    'جارٍ التحقق...',
      resendPrompt: 'لم يصلك الرمز؟',
      resend:       'إعادة الإرسال',
      resendIn:     'يمكنك إعادة الإرسال بعد {s} ثانية',
      resent:       'تم إرسال رمز جديد إلى بريدك.',
      expiresLabel: 'ينتهي الرمز في',
      invalidCode:  'رمز التحقق غير صحيح أو منتهي الصلاحية.',
      back:         'العودة لتسجيل الدخول',
    },

    validation: {
      employeeIdRequired: 'معرّف الموظف مطلوب',
      employeeIdInvalid:  'أدخل بريدًا إلكترونيًا صحيحًا أو معرّف مدير صحيح',
      passwordRequired:   'كلمة المرور مطلوبة',
      loginPasswordMin:   'كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل',
      passwordMin:        'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      passwordUppercase:  'يجب أن تحتوي على حرف كبير واحد على الأقل',
      passwordLowercase:  'يجب أن تحتوي على حرف صغير واحد على الأقل',
      passwordNumber:     'يجب أن تحتوي على رقم واحد على الأقل',
      confirmRequired:    'تأكيد كلمة المرور مطلوب',
      passwordsMismatch:  'كلمتا المرور غير متطابقتين',
    },
  },

  en: {
    langToggle: 'العربية',

    branding: {
      companyName: 'Howeyah',
      systemName:  'HR Management System',
      headline:    'Manage your team efficiently',
      description: 'An all-in-one HR platform for managing employees, payroll, attendance, and leaves.',
      features: [
        'Employee data management',
        'Attendance & time tracking',
        'Leave & absence management',
        'Payroll & bonuses processing',
      ],
      copyright: '© 2026 Howeyah — All rights reserved',
    },

    login: {
      title:                 'Sign In',
      subtitle:              'Enter your credentials to access the dashboard',
      employeeId:            'Email / Admin ID',
      employeeIdPlaceholder: 'Your email or admin UUID',
      password:              'Password',
      passwordPlaceholder:   '••••••••••••••',
      forgotPassword:        'Forgot password?',
      rememberMe:            'Remember me',
      submit:                'Sign In',
      activationPrompt:      'New employee?',
      activationAction:      'Activate account',
      activatedSuccess:      'Your account has been activated. You can now sign in.',
    },

    setPassword: {
      title:           'Set Password',
      subtitle:        'Create a strong password to activate your account',
      password:        'New Password',
      confirmPassword: 'Confirm Password',
      forgotPassword:  'Forgot password?',
      rememberMe:      'Remember me',
      submit:          'Activate Account',
      activating:      'Activating...',
    },

    invite: {
      validating:   'Validating your invite link...',
      expiredTitle: 'Invite link expired',
      expiredDesc:  'This link has expired or has already been used. Contact your system administrator for a new link.',
      greeting:     'Hello',
      accountEmail: 'Email',
    },

    magicLink: {
      checkEmailTitle:  'Check your email',
      checkEmailDesc:   'We sent a secure sign-in link to your email. Click it to finish signing in.',
      expiresLabel:     'Link expires at',
      backToLogin:      'Back to sign in',
      verifying:        'Verifying your sign-in link...',
      invalidTitle:     'Invalid sign-in link',
      invalidDesc:      'This link has expired or was already used. Please try signing in again.',
    },

    otp: {
      title:        'Verification code',
      subtitle:     'We sent a 6-digit verification code to your email. Enter it to finish signing in.',
      codeLabel:    'Verification code',
      placeholder:  '______',
      submit:       'Verify & sign in',
      verifying:    'Verifying...',
      resendPrompt: "Didn't get the code?",
      resend:       'Resend',
      resendIn:     'You can resend in {s}s',
      resent:       'A new code has been sent to your email.',
      expiresLabel: 'Code expires at',
      invalidCode:  'The verification code is incorrect or expired.',
      back:         'Back to sign in',
    },

    validation: {
      employeeIdRequired: 'Employee ID is required',
      employeeIdInvalid:  'Enter a valid email address or admin ID',
      passwordRequired:   'Password is required',
      loginPasswordMin:   'Password must be at least 6 characters',
      passwordMin:        'Password must be at least 8 characters',
      passwordUppercase:  'Must contain at least one uppercase letter',
      passwordLowercase:  'Must contain at least one lowercase letter',
      passwordNumber:     'Must contain at least one number',
      confirmRequired:    'Please confirm your password',
      passwordsMismatch:  'Passwords do not match',
    },
  },
} as const;
