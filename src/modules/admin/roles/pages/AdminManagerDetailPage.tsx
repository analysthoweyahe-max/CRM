import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES } from '@/app/router/routes';
import { Card }   from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge }  from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { extractApiError } from '@/shared/utils/error.utils';
import { InfoRow } from '@/modules/admin/employees/components/InfoRow';
import { getRoleLabel } from '@/modules/admin/employees/types/adminEmployee.types';
import type { AdminEmployeeStatus } from '@/modules/admin/employees/types/adminEmployee.types';
import { useAdminManagerDetail } from '../hooks/useAdminManagerDetail';
import { useDeleteAdmin } from '../hooks/useDeleteAdmin';
import { useUpdateAdmin } from '../hooks/useAssignAdminRole';
import { useRoleList } from '../hooks/useRoles';
import { assignableRoles } from '../utils/role.utils';
import { DeleteManagerModal } from '../components/DeleteManagerModal';
import { AssignRoleModal } from '../components/AssignRoleModal';
import type { AssignRolePayload } from '../components/AssignRoleModal';

const STATUS_VARIANT: Record<AdminEmployeeStatus, 'success' | 'error' | 'warning'> = {
  active:   'success',
  inactive: 'error',
  pending:  'warning',
};

export function AdminManagerDetailPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const { manager, raw, isLoading } = useAdminManagerDetail();
  const { mutate: deleteAdmin, isPending: deleting } = useDeleteAdmin();
  const { mutate: updateAdmin, isPending: updating } = useUpdateAdmin();
  const { data: allRoles = [] } = useRoleList();
  const managerRoles = assignableRoles(allRoles);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  function goBack() {
    navigate(ROUTES.ADMIN.MANAGERS);
  }

  function handleDelete() {
    if (!manager) return;
    deleteAdmin(manager.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف المدير' : 'Manager deleted');
        goBack();
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function handleUpdate(payload: AssignRolePayload) {
    if (!manager) return;
    updateAdmin(
      { id: manager.id, payload },
      {
        onSuccess: () => {
          toast.success(isAr ? 'تم تحديث المدير' : 'Manager updated');
          setShowEdit(false);
        },
        onError: (err) => toast.error(extractApiError(err)),
      },
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" startIcon={<BackIcon size={15} />} onClick={goBack}>
          {isAr ? 'رجوع' : 'Back'}
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr ? 'تفاصيل المديرين متاحة للمشرف العام فقط.' : 'Manager details are available to super-admins only.'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" startIcon={<BackIcon size={15} />} onClick={goBack}>
          {isAr ? 'رجوع للمديرين' : 'Back to Managers'}
        </Button>
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'المدير غير موجود' : 'Manager not found'}
        </div>
      </div>
    );
  }

  const flatPermissions = raw?.permissions ?? [];

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" startIcon={<BackIcon size={15} />} onClick={goBack}>
          {isAr ? 'رجوع للمديرين' : 'Back to Managers'}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" startIcon={<Pencil size={15} />} onClick={() => setShowEdit(true)}>
            {isAr ? 'تعديل الدور والصلاحيات' : 'Edit Role & Permissions'}
          </Button>
          <Button variant="danger" startIcon={<Trash2 size={15} />} onClick={() => setConfirmDelete(true)}>
            {isAr ? 'حذف المدير' : 'Delete Manager'}
          </Button>
        </div>
      </div>

      <Card padding="lg" className="flex flex-wrap items-center gap-4">
        <Avatar
          initial={manager.avatarInitial}
          color={manager.avatarColor}
          size="lg"
          className="w-16! h-16! text-2xl!"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{manager.name}</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{manager.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge
              label={isAr ? manager.statusLabelAr : manager.statusLabelEn}
              variant={STATUS_VARIANT[manager.status]}
            />
            {manager.roles.map((r) => (
              <Badge key={r} label={getRoleLabel(r, isAr)} variant="gray" />
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <Card padding="lg" className="space-y-1">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isAr ? 'معلومات التواصل' : 'Contact Information'}
          </h2>
          <InfoRow label={isAr ? 'البريد الإلكتروني' : 'Email'} value={manager.email} />
          <InfoRow label={isAr ? 'رقم الهاتف' : 'Phone Number'} value={manager.phone || '—'} />
        </Card>

        <Card padding="lg" className="space-y-1">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isAr ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
          </h2>
          <InfoRow
            label={isAr ? 'الحالة' : 'Status'}
            value={
              <Badge
                label={isAr ? manager.statusLabelAr : manager.statusLabelEn}
                variant={STATUS_VARIANT[manager.status]}
              />
            }
          />
          <InfoRow
            label={isAr ? 'الأدوار' : 'Roles'}
            value={
              manager.roles.length ? (
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                  {manager.roles.map((r) => (
                    <Badge key={r} label={getRoleLabel(r, isAr)} variant="gray" />
                  ))}
                </div>
              ) : '—'
            }
          />
          <InfoRow
            label={isAr ? 'الصلاحيات' : 'Permissions'}
            value={
              flatPermissions.length ? (
                <div className="flex flex-wrap items-center gap-1.5 justify-end max-w-md">
                  {flatPermissions.map((p) => (
                    <Badge key={p} label={p} variant="gray" />
                  ))}
                </div>
              ) : '—'
            }
          />
        </Card>
      </div>

      <AssignRoleModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={handleUpdate}
        isLoading={updating}
        isAr={isAr}
        title={isAr ? 'تعديل دور المدير' : 'Edit Manager Role'}
        availableRoles={managerRoles}
        assignedRoles={manager.roles}
        initialRole={manager.roles[0]}
        initialPermissions={flatPermissions}
      />

      <DeleteManagerModal
        manager={confirmDelete ? manager : null}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
