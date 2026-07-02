import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { RoleCard }              from '../components/RoleCard';
import { PermissionMatrixTable } from '../components/PermissionMatrixTable';
import { RoleFormModal }         from '../components/RoleFormModal';
import { useAdminRoles }         from '../hooks/useAdminRoles';

export function AdminRolesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    roles, matrixRoles, matrix, toggleMatrixPermission,
    showModal, editingInput,
    openCreate, openEdit, closeModal, submitRole,
  } = useAdminRoles(isAr);

  return (
    <div className="space-y-6">

      <PageHeader
        title={isAr ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
        subtitle={isAr
          ? 'إدارة أدوار المستخدمين وصلاحياتهم داخل المؤسسة'
          : 'Manage user roles and permissions within the organization'}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openCreate}>
            {isAr ? 'إنشاء دور جديد' : 'Create New Role'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map(role => (
          <RoleCard key={role.key} role={role} isAr={isAr} onEdit={() => openEdit(role)} />
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'مصفوفة الصلاحيات' : 'Permissions Matrix'}
        </h2>
        <PermissionMatrixTable roles={matrixRoles} matrix={matrix} onToggle={toggleMatrixPermission} isAr={isAr} />
      </div>

      <RoleFormModal
        open={showModal}
        onClose={closeModal}
        onSubmit={submitRole}
        initial={editingInput}
        isAr={isAr}
      />

    </div>
  );
}
