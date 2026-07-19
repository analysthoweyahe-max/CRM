import { useEffect, useMemo, useRef, useState } from 'react';
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
import { assignableRoles, permissionsForRole, resolveAssignableRoleName, extractRoleSlug } from '../utils/role.utils';
import { canEditManager, editableRoleNames } from '../utils/managerAccess.utils';
import type { ApiAdminManager, ManagerFormValues, ManagerStatus, UpdateAdminPayload } from '../types/adminManager.types';
import { managerDepartmentIds, managerLookupId } from '../types/adminManager.types';

const DANGER_STATUSES: ManagerStatus[] = ['suspended', 'banned'];

function toOrgId(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function toDeptIds(ids: string[]): number[] {
  return ids
    .map((id) => Number(id))
    .filter((n) => !Number.isNaN(n));
}

function toFormValues(raw: ApiAdminManager, registered: Set<string> | undefined): ManagerFormValues {
  const role = extractRoleSlug(raw.roles?.[0]) ?? '';
  const perms = raw.permissions ?? [];
  const jobTitleId = managerLookupId(raw.jobTitle)
    || managerLookupId(raw.job_title)
    || (raw.job_title_id != null ? String(raw.job_title_id) : '');
  return {
    name:          raw.name ?? '',
    email:         raw.email ?? '',
    phone:         raw.phone ?? '',
    departmentIds: managerDepartmentIds(raw),
    jobTitleId,
    status:        (raw.status as ManagerStatus) || 'active',
    role,
    // `undefined` registered set keeps the manager's permissions as-is (HR edit).
    permissions:   filterRegisteredPermissions(perms, registered),
  };
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function numbersEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

function buildPartialPayload(
  initial: ManagerFormValues,
  current: ManagerFormValues,
  includePermissions: boolean,
  registered: Set<string> | undefined,
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

  const nextRole = resolveAssignableRoleName(current.role);
  const prevRole = resolveAssignableRoleName(initial.role) ?? initial.role;
  if (nextRole && nextRole !== prevRole) payload.role = nextRole;

  const nextDepts = toDeptIds(current.departmentIds);
  const prevDepts = toDeptIds(initial.departmentIds);
  if (!numbersEqual(nextDepts, prevDepts)) payload.department_ids = nextDepts;

  const jobTitleId = toOrgId(current.jobTitleId);
  const initialTitle = toOrgId(initial.jobTitleId);
  if (jobTitleId !== initialTitle) payload.job_title_id = jobTitleId;

  if (includePermissions) {
    const next = filterRegisteredPermissions(current.permissions, registered);
    const prev = filterRegisteredPermissions(initial.permissions, registered);
    // Always send when the set changed — including clearing extras / toggling role defaults.
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
  // Only super-admins load the catalog; pass undefined so HR edit keeps raw permission slugs.
  const registered = useMemo(
    () => (isSuperAdmin ? toPermissionNameSet(allPermissions) : undefined),
    [isSuperAdmin, allPermissions],
  );

  const managerRoles = useMemo(() => assignableRoles(allRoles), [allRoles]);
  const roleNames = isSuperAdmin
    ? undefined
    : editableRoleNames({ isSuperAdmin, roles: user?.roles });

  const [values, setValues] = useState<ManagerFormValues | null>(null);
  const [initial, setInitial] = useState<ManagerFormValues | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** When true, role-default effect must not overwrite manual permission toggles. */
  const [preserveCustomPerms, setPreserveCustomPerms] = useState(false);
  const lastRoleForDefaults = useRef<string | null>(null);

  const targetRoles = (raw?.roles ?? [])
    .map((r) => extractRoleSlug(r) ?? (typeof r === 'string' ? r : ''))
    .filter(Boolean);
  const mayEdit = canCreate && raw && canEditManager({ isSuperAdmin, roles: user?.roles }, targetRoles);

  // Reset every field to the loaded manager once the payload (and permissions catalog, for SA) is ready.
  useEffect(() => {
    if (!raw) return;
    // Super-admin permission filter needs the catalog; HR edit must not wait on it
    // (usePermissionList is disabled for non-SA, so allPermissions stays undefined forever).
    if (isSuperAdmin && allPermissions === undefined) return;

    const form = toFormValues(raw, registered);
    setValues(form);
    setInitial(form);
    setPreserveCustomPerms(true);
    lastRoleForDefaults.current = form.role || null;
    setErrors({});
  }, [raw, registered, allPermissions, isSuperAdmin]);

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

  // Apply role default permissions only when the role actually changes (not on every render).
  useEffect(() => {
    if (!values?.role || preserveCustomPerms) return;
    if (lastRoleForDefaults.current === values.role) return;
    lastRoleForDefaults.current = values.role;
    const defaults = filterRegisteredPermissions(
      permissionsForRole(managerRoles, values.role),
      registered,
    );
    setValues(v => v ? { ...v, permissions: defaults } : v);
  }, [values?.role, managerRoles, registered, preserveCustomPerms]);

  function handleChange(patch: Partial<ManagerFormValues>) {
    if (patch.role !== undefined) {
      setPreserveCustomPerms(false);
      // Allow the role-defaults effect to run for the new role.
      if (patch.role !== lastRoleForDefaults.current) {
        lastRoleForDefaults.current = null;
      }
    }
    if (patch.permissions !== undefined) {
      setPreserveCustomPerms(true);
    }
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

    const nextRoleSlug = resolveAssignableRoleName(values.role, managerRoles);
    if (values.role && !nextRoleSlug) {
      setErrors((prev) => ({
        ...prev,
        role: isAr ? 'دور غير صالح للتعيين' : 'Invalid role for assignment',
      }));
      toast.error(isAr ? 'اختر دوراً صالحاً' : 'Please select a valid role');
      return;
    }

    if (nextRoleSlug && nextRoleSlug !== (resolveAssignableRoleName(initial.role, managerRoles) ?? initial.role)) {
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
            navigate(ROUTES.ADMIN.MANAGER_DETAIL(id));
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

  const isValid = !!(
    values.name.trim()
    && values.email.trim()
    && values.departmentIds.length > 0
    && values.jobTitleId
    && values.role
  );

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
          key={raw.id}
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
