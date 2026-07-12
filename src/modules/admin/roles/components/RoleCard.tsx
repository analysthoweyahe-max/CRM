import { Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { getRoleNameLabel } from '../types/adminRole.types';
import type { ApiRole } from '../types/adminRole.types';

interface Props {
  role:           ApiRole;
  isAr:           boolean;
  isLocked:       boolean;
  deleteLocked?:  boolean;
  onEdit:         () => void;
  onDelete?:      () => void;
}

export function RoleCard({ role, isAr, isLocked, deleteLocked, onEdit, onDelete }: Props) {
  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {onDelete && (
            <Button
              variant="icon-danger"
              aria-label={isAr ? 'حذف الدور' : 'Delete role'}
              onClick={onDelete}
              disabled={isLocked || deleteLocked}
            >
              <Trash2 size={15} />
            </Button>
          )}
          <Button
            variant="icon"
            aria-label={isAr ? 'تعديل الدور' : 'Edit role'}
            onClick={onEdit}
            disabled={isLocked}
          >
            <Pencil size={15} />
          </Button>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]">
          <ShieldCheck size={16} />
        </div>
      </div>

      <div className="text-end">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
          {getRoleNameLabel(role.name, isAr)}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all mt-0.5">
          {role.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {role.permissions.length} {isAr ? 'صلاحية' : 'permissions'}
        </p>
      </div>
    </Card>
  );
}
