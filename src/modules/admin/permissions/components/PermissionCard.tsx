import { KeyRound } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { getPermissionLabel } from '@/shared/permissions/permissionLabel.utils';

interface Props {
  slug:  string;
  isAr:  boolean;
  /** Optional API id when the permission exists in the backend */
  id?:   number | string;
}

export function PermissionCard({ slug, isAr }: Props) {
  const label = getPermissionLabel(slug, isAr);

  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-end">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <KeyRound size={16} />
        </div>
      </div>

      <div className="text-end space-y-0.5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
          {label}
        </h3>
        {label !== slug && (
          <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 break-all" dir="ltr">
            {slug}
          </p>
        )}
      </div>
    </Card>
  );
}
