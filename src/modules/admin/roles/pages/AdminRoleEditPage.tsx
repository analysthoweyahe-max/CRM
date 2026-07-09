import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useLang }     from '@/app/providers/LanguageProvider';
import { useAuth }     from '@/modules/auth/context/AuthContext';
import { ROUTES }      from '@/app/router/routes';
import { Card }        from '@/shared/components/ui/Card';
import { Button }      from '@/shared/components/ui/Button';
import { Input }       from '@/shared/components/ui/Input';
import { FormField }   from '@/shared/components/form/FormField';
import { extractApiError } from '@/shared/utils/error.utils';
import { PermissionGroupList } from '../components/PermissionGroupList';
import { useRoleList, useUpdateRole } from '../hooks/useRoles';
import { usePermissionList } from '@/modules/admin/permissions/hooks/usePermissions';
import { filterRegisteredPermissions, toPermissionNameSet } from '@/shared/permissions/permissionValidation.utils';

export function AdminRoleEditPage() {
  const { id }           = useParams<{ id: string }>();
  const { lang, isRTL }  = useLang();
  const navigate         = useNavigate();
  const { refreshUser }  = useAuth();
  const isAr             = lang === 'ar';
  const BackIcon         = isRTL ? ArrowRight : ArrowLeft;

  const { data: roles, isLoading } = useRoleList();
  const role = roles?.find((r) => String(r.id) === id);

  const { mutate: update, isPending: updating } = useUpdateRole();
  const { data: allPermissions } = usePermissionList();
  const registered = useMemo(() => toPermissionNameSet(allPermissions), [allPermissions]);

  const [name,        setName]        = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [formReady,   setFormReady]   = useState(false);

  // Re-init when navigating to a different role.
  useEffect(() => {
    setFormReady(false);
  }, [id]);

  // Load role data once per role — do not reset when the permission catalogue refetches.
  useEffect(() => {
    if (!role || formReady) return;
    if (allPermissions === undefined) return;

    setName(role.name);
    setPermissions(filterRegisteredPermissions(role.permissions, registered));
    setFormReady(true);
  }, [role, registered, allPermissions, formReady]);

  function toggle(slug: string) {
    setPermissions((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  const isValid = !!(name.trim() && permissions.length > 0);

  function handleSave() {
    if (!isValid || !role) return;
    update({ id: role.id, payload: { name: name.trim(), permissions: filterRegisteredPermissions(permissions, registered), guard_name: role.guardName } }, {
      onSuccess: async () => {
        toast.success(isAr ? 'تم تحديث الدور' : 'Role updated');
        await refreshUser();
        navigate(ROUTES.ADMIN.ROLES);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'جارٍ التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        {isAr ? 'الدور غير موجود' : 'Role not found'}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN.ROLES)}
          className="mt-1 p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <BackIcon size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {isAr ? 'تعديل الدور' : 'Edit Role'}
          </h1>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">{role.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card padding="lg">
        <div className="space-y-5">
          <FormField label={isAr ? 'اسم الدور' : 'Role Name'} required>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? 'مثال: accountant' : 'e.g. accountant'} />
          </FormField>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isAr ? 'الصلاحيات' : 'Permissions'}
            </p>
            <PermissionGroupList selected={permissions} onToggle={toggle} isAr={isAr} />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Button
            type="button"
            disabled={!isValid}
            isLoading={updating}
            startIcon={<Check size={15} />}
            onClick={handleSave}
          >
            {isAr ? 'حفظ التعديلات' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(ROUTES.ADMIN.ROLES)}
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      </Card>

    </div>
  );
}
