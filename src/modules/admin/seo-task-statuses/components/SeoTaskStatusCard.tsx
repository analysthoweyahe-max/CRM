import { Pencil, Trash2 } from 'lucide-react';
import { Card }   from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge }  from '@/shared/components/ui/Badge';
import type { ApiSeoTaskStatus } from '../types/seoTaskStatus.types';

interface Props {
  status:   ApiSeoTaskStatus;
  isAr:     boolean;
  isLocked: boolean;
  onEdit:   () => void;
  onDelete: () => void;
}

export function SeoTaskStatusCard({ status, isAr, isLocked, onEdit, onDelete }: Props) {
  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="icon-danger"
            aria-label={isAr ? 'حذف الحالة' : 'Delete status'}
            onClick={onDelete}
            disabled={isLocked}
          >
            <Trash2 size={15} />
          </Button>
          <Button
            variant="icon"
            aria-label={isAr ? 'تعديل الحالة' : 'Edit status'}
            onClick={onEdit}
            disabled={isLocked}
          >
            <Pencil size={15} />
          </Button>
        </div>
        <div className="w-9 h-9 rounded-lg shrink-0" style={{ backgroundColor: status.color || '#6366f1' }} />
      </div>

      <div className="text-end">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words">
          {isAr ? status.labelAr : status.labelEn}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all mt-0.5">
          {status.key}
        </p>
        <div className="flex items-center justify-end gap-1.5 mt-2 flex-wrap">
          {status.isDefault && <Badge label={isAr ? 'افتراضية' : 'Default'} variant="gray" />}
          {status.marksCompleted && <Badge label={isAr ? 'تعني الإنجاز' : 'Marks completed'} variant="success" />}
          {!status.isActive && <Badge label={isAr ? 'معطلة' : 'Inactive'} variant="error" />}
        </div>
      </div>
    </Card>
  );
}
