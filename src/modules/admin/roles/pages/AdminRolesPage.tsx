import { Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }    from '@/app/providers/LanguageProvider';
import { ROUTES }     from '@/app/router/routes';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { RoleCard }              from '../components/RoleCard';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { RoleFormModal }         from '../components/RoleFormModal';
import { DeleteRoleModal }       from '../components/DeleteRoleModal';
import { AddManagerModal }       from '../components/AddManagerModal';
import { useAdminRoles }         from '../hooks/useAdminRoles';

export function AdminRolesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const {
    roles, isLoading, isLocked,
    showModal, creating,
    openCreate, closeModal, submitRole,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
    showManagerModal, creatingManager,
    openManagerModal, closeManagerModal, submitManager,
  } = useAdminRoles(isAr);

  return (
    <div className="space-y-6">

      <PageHeader
        title={isAr ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
        subtitle={isAr
          ? 'إدارة أدوار المستخدمين وصلاحياتهم داخل المؤسسة'
          : 'Manage user roles and permissions within the organization'}
        actions={
          <>
            <Button variant="secondary" startIcon={<UserPlus size={15} />} onClick={openManagerModal}>
              {isAr ? 'إضافة مدير' : 'Add Manager'}
            </Button>
            <Button variant="primary" startIcon={<Plus size={15} />} onClick={openCreate}>
              {isAr ? 'إنشاء دور جديد' : 'Create New Role'}
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                isAr={isAr}
                isLocked={isLocked(role)}
                onEdit={() => navigate(ROUTES.ADMIN.ROLES_EDIT(String(role.id)))}
                onDelete={() => askDelete(role)}
              />
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {isAr ? 'مصفوفة الصلاحيات' : 'Permissions Matrix'}
            </h2>
            <PermissionMatrixTable roles={roles} isAr={isAr} />
          </div>
        </>
      )}

      <RoleFormModal
        open={showModal}
        onClose={closeModal}
        onSubmit={submitRole}
        isLoading={creating}
        isAr={isAr}
      />

      <DeleteRoleModal
        role={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

      <AddManagerModal
        open={showManagerModal}
        onClose={closeManagerModal}
        onSubmit={submitManager}
        isLoading={creatingManager}
        isAr={isAr}
      />

    </div>
  );
}
