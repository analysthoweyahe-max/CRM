import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { DepartmentCard }        from '../components/DepartmentCard';
import { DepartmentFormModal }   from '../components/DepartmentFormModal';
import { DeleteDepartmentModal } from '../components/DeleteDepartmentModal';
import { useAdminDepartmentsPage } from '../hooks/useAdminDepartmentsPage';

export function AdminDepartmentsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    departments, isLoading, isDeleteLocked,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingDepartment, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = useAdminDepartmentsPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'الأقسام' : 'Departments'}
        subtitle={isAr ? 'إدارة أقسام المؤسسة' : "Manage the organization's departments"}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {isAr ? 'إضافة قسم' : 'Add Department'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد أقسام' : 'No departments yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              isAr={isAr}
              deleteLocked={isDeleteLocked(dept)}
              onEdit={() => openEdit(dept)}
              onDelete={() => askDelete(dept)}
            />
          ))}
        </div>
      )}

      <DepartmentFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
      />

      <DepartmentFormModal
        open={!!editingDepartment}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editingDepartment}
        isLoading={updating}
        isAr={isAr}
      />

      <DeleteDepartmentModal
        department={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
