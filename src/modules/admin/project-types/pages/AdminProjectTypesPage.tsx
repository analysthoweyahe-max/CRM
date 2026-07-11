import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { ProjectTypeCard }        from '../components/ProjectTypeCard';
import { ProjectTypeFormModal }   from '../components/ProjectTypeFormModal';
import { DeleteProjectTypeModal } from '../components/DeleteProjectTypeModal';
import { useAdminProjectTypesPage } from '../hooks/useAdminProjectTypesPage';
import type { ProjectTypeFilter } from '../hooks/useAdminProjectTypesPage';

const FILTERS: { id: ProjectTypeFilter; labelAr: string; labelEn: string }[] = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'pm',  labelAr: 'إدارة المشاريع', labelEn: 'PM' },
  { id: 'seo', labelAr: 'SEO', labelEn: 'SEO' },
];

export function AdminProjectTypesPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    types, isLoading,
    filter, setFilter,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editingType, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
  } = useAdminProjectTypesPage(isAr);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isAr ? 'أنواع المشاريع' : 'Project Types'}
        subtitle={isAr
          ? 'إدارة أنواع مشاريع PM و SEO بشكل منفصل'
          : 'Manage PM and SEO project types as separate modules'}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {isAr ? 'إضافة نوع' : 'Add Type'}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors
              ${filter === f.id
                ? 'border-[#A0CD39] bg-[#A0CD39]/15 text-gray-900 dark:text-gray-100'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
          >
            {isAr ? f.labelAr : f.labelEn}
          </button>
        ))}
      </div>

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
              key={`${t.category}-${t.id}`}
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
        defaultCategory={filter === 'seo' ? 'seo' : 'pm'}
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
