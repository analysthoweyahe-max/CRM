import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { getPermissionLabel, getPermissionSlugsForGroup } from '@/shared/permissions/permissionLabel.utils';

interface MyPermissionsWidgetProps {
  profileRoute?: string;
  /** When set, only permissions from this panel group are shown (e.g. `pm-dashboard`). */
  panelGroup?: string;
}

const PREVIEW_COUNT = 4;

export function MyPermissionsWidget({ profileRoute, panelGroup }: MyPermissionsWidgetProps) {
  const { user, isSuperAdmin } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === 'ar';

  const permissions = useMemo(() => {
    if (!user) return [];
    if (!panelGroup) return user.permissions;
    const groupSlugs = new Set(getPermissionSlugsForGroup(panelGroup));
    return user.permissions.filter((slug) => groupSlugs.has(slug));
  }, [user, panelGroup]);

  if (!user) return null;

  const preview = permissions.slice(0, PREVIEW_COUNT);
  const remaining = permissions.length - preview.length;

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#D8EBAE] dark:bg-[#A0CD39]/20
                          flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-[#709028]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {isAr ? 'صلاحياتي' : 'My Permissions'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {isSuperAdmin
                ? (isAr ? 'وصول كامل' : 'Full access')
                : `${permissions.length} ${isAr ? 'صلاحية' : 'permissions'}`}
            </p>
          </div>
        </div>
      </div>

      {!isSuperAdmin && preview.length > 0 && (
        <ul className="space-y-1">
          {preview.map((perm) => (
            <li key={perm} className="text-xs text-gray-600 dark:text-gray-300 truncate">
              • {getPermissionLabel(perm, isAr)}
            </li>
          ))}
          {remaining > 0 && (
            <li className="text-xs text-gray-400 dark:text-gray-500">
              {isAr ? `+${remaining} أخرى` : `+${remaining} more`}
            </li>
          )}
        </ul>
      )}

      {profileRoute && (
        <button
          type="button"
          onClick={() => navigate(profileRoute)}
          className="text-xs font-medium text-[#709028] hover:text-[#4a6018] transition-colors"
        >
          {isAr ? 'عرض الكل ←' : 'View all →'}
        </button>
      )}
    </Card>
  );
}
