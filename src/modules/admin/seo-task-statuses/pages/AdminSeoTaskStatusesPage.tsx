import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { SeoTaskStatusCard }        from '../components/SeoTaskStatusCard';
import { SeoTaskStatusFormModal }   from '../components/SeoTaskStatusFormModal';
import { DeleteSeoTaskStatusModal } from '../components/DeleteSeoTaskStatusModal';
import { useAdminSeoTaskStatusesPage } from '../hooks/useAdminSeoTaskStatusesPage';

export function AdminSeoTaskStatusesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    statuses, isLoading, isLocked,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingStatus, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = useAdminSeoTaskStatusesPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'حالات مهام SEO' : 'SEO Task Statuses'}
        subtitle={isAr ? 'إدارة حالات المهام وألوانها وترتيبها' : 'Manage task statuses, their colors, and ordering'}
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
            <SeoTaskStatusCard
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

      <SeoTaskStatusFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
      />

      <SeoTaskStatusFormModal
        open={!!editingStatus}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editingStatus}
        isLoading={updating}
        isAr={isAr}
      />

      <DeleteSeoTaskStatusModal
        status={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
