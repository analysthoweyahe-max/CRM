import { Plus, UserPlus, Pencil, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang }    from '@/app/providers/LanguageProvider';
import { ROUTES }     from '@/app/router/routes';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { Card }       from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { RoleCard }              from '../components/RoleCard';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { RoleFormModal }         from '../components/RoleFormModal';
import { DeleteRoleModal }       from '../components/DeleteRoleModal';
import { AddManagerModal }       from '../components/AddManagerModal';
import { useAdminRoles }         from '../hooks/useAdminRoles';
import { useRoleList }           from '../hooks/useRoles';
import { assignableRoles }       from '../utils/role.utils';

export function AdminRolesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();

  const {
    roles, isLoading, isLocked, isDeleteLocked,
    showModal, creating,
    openCreate, closeModal, submitRole,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
    showManagerModal, creatingManager,
    openManagerModal, closeManagerModal, submitManager,
  } = useAdminRoles(isAr);

  const { data: allRoles = [] } = useRoleList();
  const managerRoles = assignableRoles(allRoles);

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
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {isAr ? 'الأدوار' : 'Roles'}
            </h2>

            {roles.length === 0 ? (
              <Card padding="lg">
                <EmptyState
                  icon={<ShieldCheck size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
                  title={isAr ? 'لا توجد أدوار بعد' : 'No roles yet'}
                  description={isAr
                    ? 'ابدأ بإنشاء دور جديد ثم عيّن الصلاحيات المناسبة'
                    : 'Start by creating a role, then assign the appropriate permissions'}
                  action={
                    <Button variant="primary" startIcon={<Plus size={15} />} onClick={openCreate}>
                      {isAr ? 'إنشاء دور جديد' : 'Create New Role'}
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    isAr={isAr}
                    isLocked={isLocked(role)}
                    deleteLocked={isDeleteLocked(role)}
                    onEdit={() => navigate(ROUTES.ADMIN.ROLES_EDIT(String(role.id)))}
                    onDelete={() => askDelete(role)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <Card overflow padding="none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {isAr ? 'الصلاحيات' : 'Permissions'}
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {isAr
                      ? 'نظرة عامة على صلاحيات كل دور حسب الوحدة'
                      : 'Overview of each role\'s permissions by module'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  startIcon={<Pencil size={14} />}
                  onClick={() => navigate(ROUTES.ADMIN.PERMISSIONS)}
                  className="sm:shrink-0"
                >
                  {isAr ? 'عرض وتعديل الصلاحيات' : 'View & Edit Permissions'}
                </Button>
              </div>
              <PermissionMatrixTable roles={roles} isAr={isAr} embedded />
            </Card>
          </section>
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
        availableRoles={managerRoles}
        canCustomizePermissions
      />

    </div>
  );
}
