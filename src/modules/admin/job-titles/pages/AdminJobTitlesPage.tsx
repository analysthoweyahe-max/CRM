import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { JobTitleCard }        from '../components/JobTitleCard';
import { JobTitleFormModal }   from '../components/JobTitleFormModal';
import { DeleteJobTitleModal } from '../components/DeleteJobTitleModal';
import { useAdminJobTitlesPage } from '../hooks/useAdminJobTitlesPage';

export function AdminJobTitlesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    jobTitles, departments, isLoading,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingJobTitle, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = useAdminJobTitlesPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'المسميات الوظيفية' : 'Job Titles'}
        subtitle={isAr ? 'إدارة المسميات الوظيفية في المؤسسة' : "Manage the organization's job titles"}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {isAr ? 'إضافة مسمى وظيفي' : 'Add Job Title'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : jobTitles.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد مسميات وظيفية' : 'No job titles yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobTitles.map((jt) => (
            <JobTitleCard
              key={jt.id}
              jobTitle={jt}
              isAr={isAr}
              onEdit={() => openEdit(jt)}
              onDelete={() => askDelete(jt)}
            />
          ))}
        </div>
      )}

      <JobTitleFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        departments={departments}
        isLoading={creating}
        isAr={isAr}
      />

      <JobTitleFormModal
        open={!!editingJobTitle}
        onClose={closeEdit}
        onSubmit={submitEdit}
        departments={departments}
        initial={editingJobTitle}
        isLoading={updating}
        isAr={isAr}
      />

      <DeleteJobTitleModal
        jobTitle={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
