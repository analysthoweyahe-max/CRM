import { useEffect } from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { Card } from '@/shared/components/ui/Card';
import { getPermissionLabel } from '@/shared/permissions/permissionLabel.utils';

export function MyPermissionsCard() {
  const { user, isSuperAdmin, refreshUser } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  if (!user) return null;

  // Admins: effective permissions come from the flat `permissions` array.
  const showFlatPermissions = user.actor === 'admin' || !user.roleDetails?.length;
  const roleDetailsWithPermissions = (user.roleDetails ?? []).filter(
    (detail) => detail.permissions.length > 0,
  );
  const hasRoleDetails = !showFlatPermissions && roleDetailsWithPermissions.length > 0;

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-[#709028] shrink-0" />
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'صلاحياتي' : 'My Permissions'}
        </h3>
      </div>

      {isSuperAdmin && (
        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
          {isAr
            ? 'لديك صلاحيات كاملة كسوبر أدمن — جميع الأقسام والإجراءات متاحة.'
            : 'You have full super-admin access — all sections and actions are available.'}
        </p>
      )}

      {user.actor === 'employee' && user.sectionLabel && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
            {isAr ? 'قسمي' : 'My Section'}
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {user.sectionLabel}
          </p>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {isAr ? 'أدواري' : 'My Roles'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(user.roles.length > 0 ? user.roles : [user.role]).map((role) => (
            <span
              key={role}
              className="text-xs font-medium px-2.5 py-1 rounded-full
                         bg-[#D8EBAE] text-[#4a6018] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {hasRoleDetails ? (
        <div className="space-y-3">
          {roleDetailsWithPermissions.map((detail) => (
            <div key={detail.name}>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1.5">
                {detail.name}
              </p>
              <ul className="space-y-1">
                {detail.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check size={14} className="text-[#709028] shrink-0" />
                    <span className="text-xs">{getPermissionLabel(perm, isAr)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {isAr ? 'صلاحياتي' : 'My Permissions'}
            {' '}
            ({user.permissions.length})
          </p>
          {user.permissions.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'لا توجد صلاحيات معينة.' : 'No permissions assigned.'}
            </p>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {user.permissions.map((perm) => (
                <li key={perm} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Check size={14} className="text-[#709028] shrink-0" />
                  <span className="text-xs">{getPermissionLabel(perm, isAr)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
