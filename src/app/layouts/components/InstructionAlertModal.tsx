import { Megaphone } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { formatNotificationDateTime } from '@/shared/utils/date.utils';
import type { AppNotification } from '@/shared/types/notification.types';

interface Props {
  notification: AppNotification | null;
  isAr:         boolean;
  onClose:      () => void;
}

export function InstructionAlertModal({ notification, isAr, onClose }: Props) {
  const open = Boolean(notification);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={notification?.title || (isAr ? 'تعليمات' : 'Instruction')}
      size="md"
      footer={
        <Button type="button" onClick={onClose}>
          {isAr ? 'حسناً' : 'OK'}
        </Button>
      }
    >
      {notification && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center
                            bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028] shrink-0">
              <Megaphone size={18} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {formatNotificationDateTime(notification.createdAt, isAr)}
            </p>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {notification.body}
          </p>
        </div>
      )}
    </Modal>
  );
}
