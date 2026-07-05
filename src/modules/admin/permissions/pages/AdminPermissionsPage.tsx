import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { PermissionCard }        from '../components/PermissionCard';
import { PermissionFormModal }   from '../components/PermissionFormModal';
import { DeletePermissionModal } from '../components/DeletePermissionModal';
import { useAdminPermissionsPage } from '../hooks/useAdminPermissionsPage';

export function AdminPermissionsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    permissions, isLoading, isLocked,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingPermission, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = useAdminPermissionsPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'الصلاحيات' : 'Permissions'}
        subtitle={isAr ? 'إدارة كتالوج الصلاحيات المتاحة للأدوار' : 'Manage the permission catalogue available to roles'}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {isAr ? 'إضافة صلاحية' : 'Add Permission'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : permissions.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد صلاحيات' : 'No permissions yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {permissions.map((p) => (
            <PermissionCard
              key={p.id}
              permission={p}
              isAr={isAr}
              isLocked={isLocked(p)}
              onEdit={() => openEdit(p)}
              onDelete={() => askDelete(p)}
            />
          ))}
        </div>
      )}

      <PermissionFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
      />

      <PermissionFormModal
        open={!!editingPermission}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editingPermission}
        isLoading={updating}
        isAr={isAr}
      />

      <DeletePermissionModal
        permission={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
