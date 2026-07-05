import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import type { ApiPermission } from '../types/adminPermission.types';

interface Props {
  permission: ApiPermission;
  isAr:       boolean;
  isLocked:   boolean;
  onEdit:     () => void;
  onDelete:   () => void;
}

export function PermissionCard({ permission, isAr, isLocked, onEdit, onDelete }: Props) {
  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="icon-danger"
            aria-label={isAr ? 'حذف الصلاحية' : 'Delete permission'}
            onClick={onDelete}
            disabled={isLocked}
          >
            <Trash2 size={15} />
          </Button>
          <Button
            variant="icon"
            aria-label={isAr ? 'تعديل الصلاحية' : 'Edit permission'}
            onClick={onEdit}
            disabled={isLocked}
          >
            <Pencil size={15} />
          </Button>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <KeyRound size={16} />
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono text-end break-all">
        {permission.name}
      </h3>
    </Card>
  );
}
