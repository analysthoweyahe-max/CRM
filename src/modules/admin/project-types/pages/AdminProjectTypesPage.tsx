import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { ProjectTypeCard }        from '../components/ProjectTypeCard';
import { ProjectTypeFormModal }   from '../components/ProjectTypeFormModal';
import { DeleteProjectTypeModal } from '../components/DeleteProjectTypeModal';
import { useAdminProjectTypesPage } from '../hooks/useAdminProjectTypesPage';

export function AdminProjectTypesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    types, isLoading,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingType, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = useAdminProjectTypesPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'أنواع المشاريع' : 'Project Types'}
        subtitle={isAr ? 'إدارة أنواع المشاريع المتاحة عند إنشاء مشروع جديد' : 'Manage the project types available when creating a new project'}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {isAr ? 'إضافة نوع' : 'Add Type'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد أنواع مشاريع بعد' : 'No project types yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {types.map((t) => (
            <ProjectTypeCard
              key={t.id}
              type={t}
              isAr={isAr}
              onEdit={() => openEdit(t)}
              onDelete={() => askDelete(t)}
            />
          ))}
        </div>
      )}

      <ProjectTypeFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
      />

      <ProjectTypeFormModal
        open={!!editingType}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editingType}
        isLoading={updating}
        isAr={isAr}
      />

      <DeleteProjectTypeModal
        type={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
