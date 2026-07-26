import { forwardRef } from 'react';
import { ListChecks } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Combobox } from '@/shared/components/form/Combobox';
import { TablePagination } from '@/shared/components/tables/TablePagination';
import { TaskBriefCard } from './TaskBriefCard';
import type { TaskBrief, TaskStatusCount } from '../types/taskBrief.types';
import { extractProjectsFromTaskBriefs } from '../utils/taskBriefs.utils';

export interface TasksSectionPagination {
  page:         number;
  lastPage:     number;
  total:        number;
  perPage:      number;
  onPageChange: (page: number) => void;
}

interface Props {
  titleAr:               string;
  titleEn:               string;
  statusOptions:         TaskStatusCount[];
  activeStatus:          string;
  onActiveStatusChange:  (key: string) => void;
  activeProject:         string;
  onActiveProjectChange: (id: string) => void;
  tasks:                 TaskBrief[];
  isLoading:             boolean;
  isAr:                  boolean;
  pagination?:           TasksSectionPagination;
}

export const TasksSection = forwardRef<HTMLDivElement, Props>(function TasksSection({
  titleAr, titleEn, statusOptions, activeStatus, onActiveStatusChange,
  activeProject, onActiveProjectChange, tasks, isLoading, isAr, pagination,
}, ref) {
  const projectItems = extractProjectsFromTaskBriefs(tasks).map(p => ({ id: String(p.id), label: p.name }));
  const projectComboItems = [{ id: '', label: isAr ? 'كل المشاريع' : 'All Projects' }, ...projectItems];

  const tabs = [{ key: '', label: isAr ? 'الكل' : 'All', color: '#9CA3AF', count: undefined as number | undefined }, ...statusOptions];

  return (
    <div ref={ref}>
      <Card>
        <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isAr ? titleAr : titleEn}
          </h2>
          <div className="w-full sm:w-56">
            <Combobox
              items={projectComboItems}
              value={activeProject}
              onChange={onActiveProjectChange}
              placeholder={isAr ? 'كل المشاريع' : 'All Projects'}
              searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
              noResultsText={isAr ? 'لا نتائج' : 'No results'}
            />
          </div>
        </div>

        <div className="flex items-end gap-1 px-5 mt-4 border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto">
          {tabs.map(tab => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key || 'all'}
                type="button"
                onClick={() => onActiveStatusChange(tab.key)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium
                            border-b-2 transition-colors duration-150 whitespace-nowrap
                            ${isActive
                              ? 'border-[#A0CD39] text-[#709028] dark:text-[#A0CD39]'
                              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold
                                    flex items-center justify-center
                                    ${isActive
                                      ? 'bg-[#A0CD39] text-gray-900'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center">
              <ListChecks size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {isAr ? 'لا توجد مهام في هذه الحالة' : 'No tasks in this status'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tasks.map(task => (
                <TaskBriefCard key={task.id} task={task} isAr={isAr} />
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.lastPage > 1 && (
          <TablePagination
            pageIndex={pagination.page - 1}
            pageCount={pagination.lastPage}
            totalRows={pagination.total}
            firstRow={(pagination.page - 1) * pagination.perPage + 1}
            lastRow={Math.min(pagination.page * pagination.perPage, pagination.total)}
            canPrev={pagination.page > 1}
            canNext={pagination.page < pagination.lastPage}
            onPrev={() => pagination.onPageChange(pagination.page - 1)}
            onNext={() => pagination.onPageChange(pagination.page + 1)}
            onPage={(i) => pagination.onPageChange(i + 1)}
            isAr={isAr}
          />
        )}
      </Card>
    </div>
  );
});
