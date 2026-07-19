import { CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { HomeTaskFilters } from '@/shared/modules/my-tasks/components/HomeTaskFilters';
import { TodayTaskCard } from './TodayTaskCard';
import { useSeoHomeTaskFilters } from '../hooks/useSeoHomeTaskFilters';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';

interface Props {
  tasks:     SeoTask[];
  isLoading: boolean;
  isAr:      boolean;
}

export function SeoHomeTasksSection({ tasks, isLoading, isAr }: Props) {
  const navigate = useNavigate();
  const {
    status, project, deadline,
    statusItems, projectItems, deadlineItems,
    onStatus, onProject, onDeadline,
    pageItems, page, pageCount, total, firstRow, lastRow, canPrev, canNext, setPage,
  } = useSeoHomeTaskFilters(tasks, isAr);

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {isAr ? 'مهامي' : 'My Tasks'}
      </h2>

      {tasks.length > 0 && (
        <div className="mb-4">
          <HomeTaskFilters
            statusItems={statusItems}
            projectItems={projectItems}
            deadlineItems={deadlineItems}
            status={status}
            project={project}
            deadline={deadline}
            onStatus={onStatus}
            onProject={onProject}
            onDeadline={onDeadline}
            isAr={isAr}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400 dark:text-gray-500">
          <CalendarCheck size={28} className="opacity-50" />
          <p className="text-sm">
            {tasks.length === 0
              ? (isAr ? 'لا توجد مهام مسندة إليك حاليًا' : 'You have no assigned tasks yet')
              : (isAr ? 'لا توجد مهام مطابقة للتصفية' : 'No tasks match the selected filters')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pageItems.map(task => (
            <TodayTaskCard
              key={task.id}
              task={task}
              isAr={isAr}
              onDetails={(t) => {
                const projectId = t.project?.id;
                if (!projectId) return;
                navigate(ROUTES.SEO_MEMBER.TASK_DETAIL(projectId, t.id));
              }}
            />
          ))}
        </div>
      )}

      {total > 0 && pageCount > 1 && (
        <div className="mt-4 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <TablePagination
            isAr={isAr}
            pageIndex={page - 1}
            pageCount={pageCount}
            totalRows={total}
            firstRow={firstRow}
            lastRow={lastRow}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
            onPage={(i) => setPage(i + 1)}
          />
        </div>
      )}
    </div>
  );
}
