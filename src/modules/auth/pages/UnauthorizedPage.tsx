import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { ROUTES } from '@/app/router/routes';
import type { Role } from '@/shared/types/role.types';

function homeDashboard(role: Role | undefined): string {
  switch (role) {
    case 'admin':      return ROUTES.ADMIN.DASHBOARD;
    case 'employee':   return ROUTES.EMPLOYEE.DASHBOARD;
    case 'manager':    return ROUTES.PROJECT_MANAGER.DASHBOARD;
    case 'seo-leader': return ROUTES.SEO_LEADER.DASHBOARD;
    case 'seo-member': return ROUTES.SEO_MEMBER.DASHBOARD;
    default:           return ROUTES.DASHBOARD;
  }
}

export function UnauthorizedPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const isAr = lang === 'ar';

  const from = (location.state as { from?: string } | null)?.from;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30
                        flex items-center justify-center">
          <ShieldX size={32} className="text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'غير مصرح' : 'Unauthorized'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAr
              ? 'ليس لديك الصلاحية للوصول إلى هذه الصفحة. تواصل مع المشرف إذا كنت تعتقد أن هذا خطأ.'
              : 'You do not have permission to access this page. Contact your administrator if you believe this is a mistake.'}
          </p>
          {from && (
            <p className="text-xs font-mono text-gray-400 dark:text-gray-500 break-all">
              {from}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       border border-gray-200 dark:border-gray-700
                       text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            {isAr ? 'رجوع' : 'Go Back'}
          </button>
          <button
            type="button"
            onClick={() => navigate(homeDashboard(user?.role))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-[#A0CD39] text-gray-900 hover:bg-[#8fb832] transition-colors"
          >
            <Home size={16} />
            {isAr ? 'الرئيسية' : 'Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
