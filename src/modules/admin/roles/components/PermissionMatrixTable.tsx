import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { PermissionChip } from './PermissionChip';
import { PERMISSION_GROUPS, getRoleNameLabel } from '../types/adminRole.types';
import { roleHasPermission } from '../utils/role.utils';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  roles:    ApiRole[];
  isAr:     boolean;
  embedded?: boolean;
}

const STICKY_CELL = [
  'sticky start-0 z-10',
  'bg-inherit',
  'shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)]',
  'dark:shadow-[4px_0_8px_-4px_rgba(0,0,0,0.35)]',
].join(' ');

export function PermissionMatrixTable({ roles, isAr, embedded = false }: Props) {
  const table = (
    <div className="overflow-x-auto">
      {roles.length === 0 ? (
        <EmptyState
          title={isAr ? 'لا توجد أدوار لعرض الصلاحيات' : 'No roles to display permissions for'}
          description={isAr
            ? 'أنشئ دوراً جديداً لعرض مصفوفة الصلاحيات'
            : 'Create a role to see the permissions matrix'}
          className="py-12"
        />
      ) : (
        <table
          className="w-full min-w-max text-sm border-separate border-spacing-0"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/40">
              <th
                className={[
                  STICKY_CELL,
                  'px-5 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400',
                  'whitespace-nowrap min-w-[10rem] border-b border-gray-100 dark:border-gray-700',
                  'bg-gray-50 dark:bg-gray-700/40',
                ].join(' ')}
              >
                {isAr ? 'الوحدة' : 'Module'}
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="px-5 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap min-w-[11rem] border-b border-gray-100 dark:border-gray-700"
                >
                  {getRoleNameLabel(role.name, isAr)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group, index) => (
              <tr
                key={group.key}
                className={index % 2 === 0
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50/60 dark:bg-gray-800/60'}
              >
                <td
                  className={[
                    STICKY_CELL,
                    'px-5 py-3.5 text-start font-medium text-gray-700 dark:text-gray-300',
                    'whitespace-nowrap border-b border-gray-50 dark:border-gray-700/50',
                  ].join(' ')}
                >
                  {isAr ? group.labelAr : group.labelEn}
                </td>
                {roles.map((role) => (
                  <td
                    key={role.id}
                    className="px-5 py-3.5 align-top border-b border-gray-50 dark:border-gray-700/50"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {group.slugs.map(({ slug, labelAr, labelEn }) => (
                        <PermissionChip
                          key={slug}
                          label={isAr ? labelAr : labelEn}
                          active={roleHasPermission(role, slug)}
                        />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (embedded) return table;

  return (
    <Card overflow>
      {table}
    </Card>
  );
}
