import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { markNotificationToasted, wasNotificationToasted } from './notificationSeen.store';

interface ShowInAppNotificationOptions {
  id?:        string;
  dedupKeys?: string[];
  title:      string;
  body?:      string;
  isAr:       boolean;
  onView?:    () => void;
}

/** Prominent in-page toast — only for notifications not already shown this session. */
export function showInAppNotification({
  id,
  dedupKeys,
  title,
  body,
  isAr,
  onView,
}: ShowInAppNotificationOptions): void {
  const contentKey = `${title}::${body ?? ''}`;
  const keys = (dedupKeys?.length ? dedupKeys : [id, contentKey]).filter(Boolean) as string[];

  if (keys.some(wasNotificationToasted)) return;

  keys.forEach(markNotificationToasted);

  const toastId = id ?? keys[0] ?? contentKey;

  toast.custom(
    (t) => (
      <div
        role="alert"
        className="w-full max-w-md rounded-2xl border border-[#D8EBAE] dark:border-[#A0CD39]/30
                   bg-white dark:bg-gray-800 shadow-xl shadow-[#A0CD39]/10
                   overflow-hidden pointer-events-auto"
      >
        <div className="h-1 bg-gradient-to-r from-[#A0CD39] to-[#709028]" />
        <div className="flex items-start gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-[#D8EBAE]/60 dark:bg-[#A0CD39]/20
                          flex items-center justify-center shrink-0">
            <Bell size={18} className="text-[#709028] dark:text-[#A0CD39]" />
          </div>
          <div className="flex-1 min-w-0 text-start">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {title}
            </p>
            {body && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {body}
              </p>
            )}
            {onView && (
              <button
                type="button"
                onClick={() => { toast.dismiss(t); onView(); }}
                className="mt-2.5 text-xs font-semibold text-[#709028] dark:text-[#A0CD39] hover:underline"
              >
                {isAr ? 'عرض التفاصيل ←' : 'View details →'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none shrink-0"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            ×
          </button>
        </div>
      </div>
    ),
    {
      id:          toastId,
      duration:    12_000,
      position:    'top-center',
      dismissible: true,
    },
  );
}
