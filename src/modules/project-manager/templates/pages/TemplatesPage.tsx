import { Plus } from 'lucide-react';
import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button }     from '@/shared/components/ui/Button';
import { Card }       from '@/shared/components/ui/Card';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { TemplateCard }       from '../components/TemplateCard';
import { TemplateFormModal }  from '../components/TemplateFormModal';
import { DeleteTemplateModal } from '../components/DeleteTemplateModal';
import { useTemplatesPage }   from '../hooks/useTemplatesPage';
import type { TemplateModule } from '../api/projectTemplate.api';

interface Props {
  module?: TemplateModule;
}

export function TemplatesPage({ module = 'pm' }: Props) {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const isSeo    = module === 'seo';

  const {
    search, setSearch,
    page, setPage, lastPage, total,
    templates, isLoading,
    showAdd, openAdd, closeAdd, submitAdd, creating,
    editing, openEdit, closeEdit, submitEdit, updating,
    pendingDelete, askDelete, cancelDelete, confirmDelete, deleting,
    fieldErrors, clearFieldError,
  } = useTemplatesPage(isAr, module);

  const perPage  = 15;
  const firstRow = total === 0 ? 0 : (page - 1) * perPage + 1;
  const lastRow  = Math.min(page * perPage, total);

  return (
    <div className="space-y-5">

      <PageHeader
        title={isSeo
          ? (isAr ? 'قوالب مشاريع SEO' : 'SEO Project Templates')
          : (isAr ? 'قوالب المشاريع' : 'Project Templates')}
        subtitle={isSeo
          ? (isAr ? 'قوالب مراحل خاصة بمشاريع SEO' : 'Reusable phase templates for SEO projects')
          : (isAr ? 'قوالب مراحل قابلة لإعادة الاستخدام حسب نوع المشروع' : 'Reusable phase templates per project type')}
        actions={
          <Button variant="primary" startIcon={<Plus size={15} />} onClick={openAdd}>
            {isAr ? 'إضافة قالب' : 'Add Template'}
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder={isAr ? 'ابحث عن قالب...' : 'Search templates...'}
        className="max-w-sm"
      />

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
          {isAr ? 'لا توجد قوالب بعد' : 'No templates yet'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <TemplateCard
                key={t.uuid}
                template={t}
                isAr={isAr}
                onEdit={() => openEdit(t)}
                onDelete={() => askDelete(t)}
              />
            ))}
          </div>

          {lastPage > 1 && (
            <Card>
              <TablePagination
                pageIndex={page - 1}
                pageCount={lastPage}
                totalRows={total}
                firstRow={firstRow}
                lastRow={lastRow}
                canPrev={page > 1}
                canNext={page < lastPage}
                onPrev={() => setPage(Math.max(1, page - 1))}
                onNext={() => setPage(Math.min(lastPage, page + 1))}
                onPage={(i) => setPage(i + 1)}
                isAr={isAr}
              />
            </Card>
          )}
        </>
      )}

      <TemplateFormModal
        open={showAdd}
        onClose={closeAdd}
        onSubmit={submitAdd}
        isLoading={creating}
        isAr={isAr}
        module={module}
        fieldErrors={fieldErrors}
        onClearFieldError={clearFieldError}
      />

      <TemplateFormModal
        open={!!editing}
        onClose={closeEdit}
        onSubmit={submitEdit}
        initial={editing}
        isLoading={updating}
        isAr={isAr}
        module={module}
        fieldErrors={fieldErrors}
        onClearFieldError={clearFieldError}
      />

      <DeleteTemplateModal
        template={pendingDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
        isAr={isAr}
      />

    </div>
  );
}
