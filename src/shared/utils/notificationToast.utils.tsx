import { toast } from 'sonner';
import { Bell, X } from 'lucide-react';
import { formatNotificationDateTime } from '@/shared/utils/date.utils';
import { markNotificationToasted, wasNotificationToasted } from './notificationSeen.store';
import { isTabActive, showDesktopNotification } from './desktopNotification.utils';

const TOAST_DURATION_MS = 4_000;

interface ShowInAppNotificationOptions {
  id?:        string;
  dedupKeys?: string[];
  title:      string;
  body?:      string;
  createdAt?: string;
  isAr:       boolean;
  onView?:    () => void;
  /** Skip the OS/device notification — e.g. an FCM push already showed one via
   *  the service worker's background handler, so raising another here would
   *  duplicate it. */
  skipDesktopNotification?: boolean;
}

/** Prominent in-page toast — only for notifications not already shown this session.
 *  Returns true when a toast was actually shown. */
export function showInAppNotification({
  id,
  dedupKeys,
  title,
  body,
  createdAt,
  isAr,
  onView,
  skipDesktopNotification,
}: ShowInAppNotificationOptions): boolean {
  const contentKey = `${title}::${body ?? ''}`;
  const keys = (dedupKeys?.length ? dedupKeys : [id, contentKey]).filter(Boolean) as string[];

  if (keys.some(wasNotificationToasted)) return false;

  keys.forEach(markNotificationToasted);

  const toastId = id ?? keys[0] ?? contentKey;

  // Tab isn't in view — the in-page toast below won't be seen, so also raise
  // an OS/device notification (no-op if permission was never granted).
  if (!skipDesktopNotification && !isTabActive()) {
    showDesktopNotification({
      title:   title,
      body:    body ?? '',
      tag:     toastId,
      onClick: onView,
    });
  }

  toast.custom(
    (t) => (
      <div
        role="alert"
        dir={isAr ? 'rtl' : 'ltr'}
        className="w-[min(100vw-2rem,22rem)] rounded-2xl border border-[#D8EBAE] dark:border-[#A0CD39]/30
                   bg-white dark:bg-gray-800 shadow-xl shadow-[#A0CD39]/15
                   overflow-hidden pointer-events-auto"
      >
        <div className="flex items-start gap-3 p-3.5 pb-3">
          <div className="w-10 h-10 rounded-xl bg-[#D8EBAE]/70 dark:bg-[#A0CD39]/20
                          flex items-center justify-center shrink-0">
            <Bell size={18} className="text-[#709028] dark:text-[#A0CD39]" />
          </div>
          <div className="flex-1 min-w-0 text-start">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {title}
            </p>
            {body && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {body}
              </p>
            )}
            {createdAt && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                {formatNotificationDateTime(createdAt, isAr)}
              </p>
            )}
            {onView && (
              <button
                type="button"
                onClick={() => { toast.dismiss(t); onView(); }}
                className="mt-2 text-xs font-semibold text-[#709028] dark:text-[#A0CD39]
                           hover:underline underline-offset-2"
              >
                {isAr ? 'عرض التفاصيل ←' : 'View details →'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t)}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                       text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X size={14} />
          </button>
        </div>
        <div className="h-1 bg-[#D8EBAE]/50 dark:bg-[#A0CD39]/10 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-[#A0CD39] to-[#709028] ${isAr ? 'origin-right' : 'origin-left'}`}
            style={{
              animation: `notif-toast-shrink ${TOAST_DURATION_MS}ms linear forwards`,
            }}
          />
        </div>
        <style>{`
          @keyframes notif-toast-shrink {
            from { transform: scaleX(1); }
            to   { transform: scaleX(0); }
          }
        `}</style>
      </div>
    ),
    {
      id:          toastId,
      duration:    TOAST_DURATION_MS,
      position:    'top-center',
      dismissible: true,
      closeButton: false,
      className:   '!bg-transparent !border-0 !shadow-none !p-0 !w-auto',
    },
  );

  return true;
}
