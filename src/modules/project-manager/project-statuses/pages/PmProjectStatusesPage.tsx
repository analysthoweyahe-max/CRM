import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { PmProjectStatusCard }        from '../components/PmProjectStatusCard';
import { PmProjectStatusFormModal }   from '../components/PmProjectStatusFormModal';
import { DeletePmProjectStatusModal } from '../components/DeletePmProjectStatusModal';
import { usePmProjectStatusesPage }    from '../hooks/usePmProjectStatusesPage';

export function PmProjectStatusesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    statuses, isLoading, isLocked,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingStatus, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = usePmProjectStatusesPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'حالات مشاريع PM' : 'PM Project Statuses'}
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
            <PmProjectStatusCard
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

      <PmProjectStatusFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
      />

      <PmProjectStatusFormModal
        open={!!editingStatus}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editingStatus}
        isLoading={updating}
        isAr={isAr}
      />

      <DeletePmProjectStatusModal
        status={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
