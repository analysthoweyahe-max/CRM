import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { FolderKanban } from 'lucide-react';
import { MyProjectCard } from '../components/MyProjectCard';
import { MyProjectsFilters } from '../components/MyProjectsFilters';
import { MyProjectsSectionsView } from '../components/MyProjectsSectionsView';
import { useMyProjectsPage } from '../hooks/useMyProjectsPage';
import { PER_PAGE } from '../utils/myProjects.utils';
import type { MyProjectsModule } from '../types/myProjects.types';

interface Props {
  module: MyProjectsModule;
}

export function MyProjectsPage({ module }: Props) {
  const navigate = useNavigate();
  const { lang, isRTL } = useLang();
  const isAr = lang === 'ar';

  const {
    config,
    search, setSearch,
    status, setStatus,
    showDrafts, setShowDrafts,
    page, setPage,
    pmProjects,
    seoProjects,
    sections,
    statusOptions,
    isLoading,
    isError,
    total,
    lastPage,
    isEmpty,
  } = useMyProjectsPage(module);

  const firstRow = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const lastRow  = Math.min(page * PER_PAGE, total);

  const subtitle = config.viewMode === 'paginated' && total > 0
    ? `${total} ${isAr ? 'مشروع' : 'projects'}`
    : undefined;

  return (
    <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'مشاريعي' : 'My Projects'}
        subtitle={subtitle}
        actions={
          config.canCreate ? (
            <Button
              variant="primary"
              startIcon={<Plus size={15} />}
              onClick={() => navigate(config.createPath)}
            >
              {isAr ? 'إنشاء مشروع' : 'Create Project'}
            </Button>
          ) : undefined
        }
      />

      <MyProjectsFilters
        isAr={isAr}
        search={search}
        onSearchChange={setSearch}
        canSearch={config.canSearch}
        status={status}
        onStatusChange={setStatus}
        canFilterStatus={config.canFilterStatus}
        statusOptions={statusOptions}
        showDrafts={showDrafts}
        onDraftsChange={setShowDrafts}
        canToggleDraft={config.canToggleDraft}
      />

      {isLoading && <LoadingSpinner />}

      {isError && !isLoading && (
        <Card className="p-8">
          <EmptyState
            title={isAr ? 'تعذّر تحميل المشاريع' : 'Failed to load projects'}
            description={isAr ? 'يرجى المحاولة مرة أخرى لاحقاً' : 'Please try again later'}
          />
        </Card>
      )}

      {!isLoading && !isError && isEmpty && (
        <Card>
          <EmptyState
            title={isAr ? 'لا توجد مشاريع حالياً' : 'No projects yet'}
            icon={<FolderKanban size={26} className="text-[#709028] dark:text-[#A0CD39]" />}
            action={
              config.canCreate ? (
                <Button variant="primary" startIcon={<Plus size={15} />} onClick={() => navigate(config.createPath)}>
                  {isAr ? 'إنشاء مشروع' : 'Create Project'}
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      {!isLoading && !isError && !isEmpty && config.viewMode === 'sections' && (
        <MyProjectsSectionsView sections={sections} config={config} isAr={isAr} />
      )}

      {!isLoading && !isError && !isEmpty && config.viewMode === 'paginated' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {module === 'pm' && pmProjects.map(project => (
              <MyProjectCard
                key={project.id}
                item={{ kind: 'pm', project }}
                config={config}
                isAr={isAr}
              />
            ))}
            {module === 'seo' && seoProjects.map(project => (
              <MyProjectCard
                key={project.id}
                item={{ kind: 'seo', project }}
                config={config}
                isAr={isAr}
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
    </div>
  );
}
