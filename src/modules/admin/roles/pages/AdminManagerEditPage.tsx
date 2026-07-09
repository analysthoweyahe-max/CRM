import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES } from '@/app/router/routes';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { extractApiError, extractApiFieldErrors, extractApiStatus } from '@/shared/utils/error.utils';
import { filterRegisteredPermissions, toPermissionNameSet } from '@/shared/permissions/permissionValidation.utils';
import { usePermissionList } from '@/modules/admin/permissions/hooks/usePermissions';
import { ManagerForm } from '../components/ManagerForm';
import { useAdminManagerDetail } from '../hooks/useAdminManagerDetail';
import { useUpdateAdmin } from '../hooks/useAssignAdminRole';
import { useRoleList } from '../hooks/useRoles';
import { assignableRoles, permissionsForRole } from '../utils/role.utils';
import { canEditManager, editableRoleNames } from '../utils/managerAccess.utils';
import type { ApiAdminManager, ManagerFormValues, ManagerStatus, UpdateAdminPayload } from '../types/adminManager.types';

const DANGER_STATUSES: ManagerStatus[] = ['suspended', 'banned'];

function toFormValues(raw: ApiAdminManager, registered: Set<string>): ManagerFormValues {
  const role = raw.roles?.[0] ?? '';
  const perms = raw.permissions ?? [];
  return {
    name:        raw.name ?? '',
    email:       raw.email ?? '',
    phone:       raw.phone ?? '',
    status:      (raw.status as ManagerStatus) || 'active',
    role,
    permissions: filterRegisteredPermissions(perms, registered),
  };
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function buildPartialPayload(
  initial: ManagerFormValues,
  current: ManagerFormValues,
  includePermissions: boolean,
  registered: Set<string>,
): UpdateAdminPayload {
  const payload: UpdateAdminPayload = {};

  const name = current.name.trim();
  if (name !== initial.name.trim()) payload.name = name;

  const email = current.email.trim();
  if (email !== initial.email.trim()) payload.email = email;

  const phone = current.phone.trim();
  if (phone !== (initial.phone ?? '').trim()) {
    payload.phone = phone || null;
  }

  if (current.status !== initial.status) payload.status = current.status;
  if (current.role !== initial.role) payload.role = current.role;

  if (includePermissions) {
    const next = filterRegisteredPermissions(current.permissions, registered);
    const prev = filterRegisteredPermissions(initial.permissions, registered);
    if (!arraysEqual(next, prev)) payload.permissions = next;
  }

  return payload;
}

export function AdminManagerEditPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const { isSuperAdmin, user, can } = useAuth();
  const canCreate = isSuperAdmin || can('create-admin');

  const stateManager = (location.state as { manager?: ApiAdminManager } | null)?.manager;
  const { raw, isLoading, notFound } = useAdminManagerDetail({ fallback: stateManager });

  const { mutate: updateAdmin, isPending: saving } = useUpdateAdmin();
  const { data: allRoles = [] } = useRoleList();
  const { data: allPermissions } = usePermissionList();
  const registered = useMemo(() => toPermissionNameSet(allPermissions), [allPermissions]);

  const managerRoles = assignableRoles(allRoles, raw?.roles ?? []);
  const roleNames = editableRoleNames({ isSuperAdmin, roles: user?.roles });

  const [values, setValues] = useState<ManagerFormValues | null>(null);
  const [initial, setInitial] = useState<ManagerFormValues | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preserveCustomPerms, setPreserveCustomPerms] = useState(false);

  const targetRoles = raw?.roles ?? [];
  const mayEdit = canCreate && raw && canEditManager({ isSuperAdmin, roles: user?.roles }, targetRoles);

  useEffect(() => {
    if (!raw || allPermissions === undefined) return;
    const form = toFormValues(raw, registered);
    setValues(form);
    setInitial(form);
    setPreserveCustomPerms(!!form.permissions.length);
    setErrors({});
  }, [raw, registered, allPermissions]);

  const isDirty = useMemo(() => {
    if (!values || !initial) return false;
    return JSON.stringify(values) !== JSON.stringify(initial);
  }, [values, initial]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!values || preserveCustomPerms || !values.role) return;
    const defaults = filterRegisteredPermissions(
      permissionsForRole(managerRoles, values.role),
      registered,
    );
    setValues(v => v ? { ...v, permissions: defaults } : v);
  }, [values?.role, managerRoles, registered, preserveCustomPerms]);

  function handleChange(patch: Partial<ManagerFormValues>) {
    if (patch.role !== undefined) setPreserveCustomPerms(false);
    setValues(v => v ? { ...v, ...patch } : v);
    setErrors(prev => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function goBack() {
    if (isDirty && !window.confirm(isAr
      ? 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟'
      : 'You have unsaved changes. Leave without saving?')) return;

    if (isSuperAdmin && id) {
      navigate(ROUTES.ADMIN.MANAGER_DETAIL(id));
    } else {
      navigate(ROUTES.ADMIN.MANAGERS);
    }
  }

  function handleSave() {
    if (!values || !initial || !id || !mayEdit) return;

    if (values.role !== initial.role) {
      const ok = window.confirm(isAr
        ? 'تغيير الدور سيحدّث صلاحيات الوصول للوحدة. هل تريد المتابعة؟'
        : 'Changing role will update module access. Continue?');
      if (!ok) return;
    }

    if (DANGER_STATUSES.includes(values.status) && values.status !== initial.status) {
      const ok = window.confirm(isAr
        ? `هل أنت متأكد من تغيير الحالة إلى "${values.status}"؟`
        : `Are you sure you want to set status to "${values.status}"?`);
      if (!ok) return;
    }

    const payload = buildPartialPayload(initial, values, isSuperAdmin, registered);
    if (Object.keys(payload).length === 0) {
      toast.info(isAr ? 'لا توجد تغييرات' : 'No changes to save');
      return;
    }

    updateAdmin(
      { id, payload },
      {
        onSuccess: (res) => {
          const message = res.data.message
            || (isAr ? 'تم تحديث المدير بنجاح' : 'Manager updated successfully.');
          toast.success(message);
          if (isSuperAdmin) {
            navigate(ROUTES.ADMIN.MANAGERS);
          } else {
            navigate(ROUTES.ADMIN.MANAGERS, { replace: true });
          }
        },
        onError: (err) => {
          const status = extractApiStatus(err);
          if (status === 403) {
            toast.error(isAr ? 'ليس لديك صلاحية لتعديل هذا المدير' : 'You are not allowed to edit this manager');
            return;
          }
          if (status === 404) {
            toast.error(isAr ? 'المدير غير موجود' : 'Manager not found');
            goBack();
            return;
          }
          setErrors(extractApiFieldErrors(err));
          toast.error(extractApiError(err));
        },
      },
    );
  }

  if (!canCreate) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr ? 'ليس لديك صلاحية لتعديل المديرين.' : 'You do not have permission to edit managers.'}
        </p>
      </div>
    );
  }

  if (isLoading || (raw && !values)) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm animate-pulse">
        {isAr ? 'جارٍ التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (notFound || !raw || !values) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" startIcon={<BackIcon size={15} />} onClick={() => navigate(ROUTES.ADMIN.MANAGERS)}>
          {isAr ? 'رجوع' : 'Back'}
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr
            ? 'المدير غير موجود أو لا تتوفر بياناته. يمكن لمدير الموارد البشرية الوصول للتعديل بعد الإنشاء فقط.'
            : 'Manager not found or data unavailable. HR managers can edit only after creating a manager.'}
        </p>
      </div>
    );
  }

  if (!mayEdit) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" startIcon={<BackIcon size={15} />} onClick={goBack}>
          {isAr ? 'رجوع' : 'Back'}
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr ? 'ليس لديك صلاحية لتعديل هذا المدير.' : 'You are not allowed to edit this manager.'}
        </p>
      </div>
    );
  }

  const isValid = !!(values.name.trim() && values.email.trim() && values.role);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={goBack}
          className="mt-1 p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <BackIcon size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {isAr ? 'تعديل المدير' : 'Edit Manager'}
          </h1>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">{raw.name}</p>
        </div>
      </div>

      <Card padding="lg">
        <ManagerForm
          mode="edit"
          values={values}
          onChange={handleChange}
          errors={errors}
          isAr={isAr}
          showStatus
          showPermissions={isSuperAdmin}
          availableRoles={managerRoles}
          allowedRoleNames={roleNames}
          disableEmail={values.status === 'pending'}
        />

        <div className="sticky bottom-0 z-10 flex items-center gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Button
            type="button"
            disabled={!isValid}
            isLoading={saving}
            startIcon={<Check size={15} />}
            onClick={handleSave}
          >
            {isAr ? 'حفظ التعديلات' : 'Save Changes'}
          </Button>
          <Button type="button" variant="secondary" onClick={goBack}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
