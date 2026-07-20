import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { SeoProjectStatusCard }        from '../components/SeoProjectStatusCard';
import { SeoProjectStatusFormModal }   from '../components/SeoProjectStatusFormModal';
import { DeleteSeoProjectStatusModal } from '../components/DeleteSeoProjectStatusModal';
import { useAdminSeoProjectStatusesPage } from '../hooks/useAdminSeoProjectStatusesPage';

export function AdminSeoProjectStatusesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    statuses, isLoading, isLocked,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingStatus, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = useAdminSeoProjectStatusesPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'حالات مشاريع SEO' : 'SEO Project Statuses'}
        subtitle={isAr ? 'إدارة حالات المشاريع وألوانها وترتيبها' : 'Manage project statuses, their colors, and ordering'}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {isAr ? 'إضافة حالة' : 'Add Status'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : statuses.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد حالات' : 'No statuses yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.map((s) => (
            <SeoProjectStatusCard
              key={s.id}
              status={s}
              isAr={isAr}
              isLocked={isLocked(s)}
              onEdit={() => openEdit(s)}
              onDelete={() => askDelete(s)}
            />
          ))}
        </div>
      )}

      <SeoProjectStatusFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
      />

      <SeoProjectStatusFormModal
        open={!!editingStatus}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editingStatus}
        isLoading={updating}
        isAr={isAr}
      />

      <DeleteSeoProjectStatusModal
        status={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
