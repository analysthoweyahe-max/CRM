import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  'super-admin':     { ar: 'سوبر أدمن',        en: 'Super Admin' },
  'hr-manager':      { ar: 'مدير موارد بشرية', en: 'HR Manager' },
  'seo-manager':     { ar: 'مدير SEO',         en: 'SEO Manager' },
  'project-manager': { ar: 'مدير مشاريع',      en: 'Project Manager' },
  'pm-employee':     { ar: 'موظف مشاريع',      en: 'PM Employee' },
  'seo-employee':    { ar: 'موظف SEO',         en: 'SEO Employee' },
  employee:          { ar: 'موظف',             en: 'Employee' },
};

function labelFor(slug: string, isAr: boolean): string {
  const entry = ROLE_LABELS[slug];
  if (entry) return isAr ? entry.ar : entry.en;
  return slug.replace(/-/g, ' ');
}

interface UserRoleBadgesProps {
  className?: string;
  size?:      'sm' | 'md';
}

export function UserRoleBadges({ className = '', size = 'sm' }: UserRoleBadgesProps) {
  const { user, isSuperAdmin } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  if (!user) return null;

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  if (isSuperAdmin) {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold
                        bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300
                        ${sizeClass} ${className}`}>
        {isAr ? 'سوبر أدمن' : 'Super Admin'}
      </span>
    );
  }

  const roles = user.roles.length > 0 ? user.roles : [user.role];

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {roles.map((role) => (
        <span
          key={role}
          className={`inline-flex items-center rounded-full font-medium
                      bg-[#D8EBAE] text-[#4a6018] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]
                      ${sizeClass}`}
        >
          {labelFor(role, isAr)}
        </span>
      ))}
    </span>
  );
}
