import { useLang }    from '@/app/providers/LanguageProvider';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { PermissionCard } from '../components/PermissionCard';
import { useAdminPermissionsPage } from '../hooks/useAdminPermissionsPage';

export function AdminPermissionsPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';
  const { groups, totalCount } = useAdminPermissionsPage();

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAr ? 'الصلاحيات' : 'Permissions'}
        subtitle={
          isAr
            ? `كتالوج الصلاحيات المتاحة في المشروع (${totalCount})`
            : `Available project permissions catalogue (${totalCount})`
        }
      />

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.key} className="space-y-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {isAr ? group.labelAr : group.labelEn}
              <span className="ms-2 text-xs font-normal text-gray-400">
                ({group.slugs.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.slugs.map((slug) => (
                <PermissionCard key={slug} slug={slug} isAr={isAr} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
