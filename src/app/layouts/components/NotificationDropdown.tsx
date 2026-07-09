import { useEffect, useState } from 'react';
import { CalendarCheck, MessageSquare, Wallet, AtSign, Megaphone, Bell, ClipboardList } from 'lucide-react';
import type { AppNotification } from '@/shared/types/notification.types';
import { formatTimeAgo } from '@/shared/utils/date.utils';

interface Props {
  notifications: AppNotification[];
  isAr:          boolean;
  onMarkAllRead: () => void;
  onMarkRead:    (id: string) => void;
  onNavigate?:   (notification: AppNotification) => void;
}

/* Backend notification `type` values seen so far — anything else falls back
   to a generic bell icon rather than needing every type enumerated up front. */
const TYPE_ICON: Record<string, React.ReactNode> = {
  leave:                  <CalendarCheck size={14} />,
  message:                <MessageSquare size={14} />,
  deduction_applied:      <Wallet size={14} />,
  bonus_applied:          <Wallet size={14} />,
  PmMentionNotification:  <AtSign size={14} />,
  alert:                  <Megaphone size={14} />,
  test_notification:      <Bell size={14} />,
  seo_task_assigned:      <ClipboardList size={14} />,
  seo_task_status_changed:<ClipboardList size={14} />,
  seo_mention:            <AtSign size={14} />,
  pm_task_assigned:       <ClipboardList size={14} />,
  hr_leave_submitted:     <CalendarCheck size={14} />,
  pm_project_message:     <MessageSquare size={14} />,
  seo_project_message:    <MessageSquare size={14} />,
  hr_message:             <MessageSquare size={14} />,
};

const TYPE_ICON_BG: Record<string, string> = {
  leave:                  'bg-[#D8EBAE] text-[#709028]',
  message:                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  deduction_applied:      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  bonus_applied:          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  PmMentionNotification:  'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  alert:                  'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]',
  test_notification:      'bg-gray-100 dark:bg-gray-700 text-gray-500',
  seo_task_assigned:      'bg-[#D8EBAE] text-[#709028]',
  seo_task_status_changed:'bg-[#D8EBAE] text-[#709028]',
  seo_mention:            'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  pm_task_assigned:       'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  hr_leave_submitted:     'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  pm_project_message:     'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  seo_project_message:    'bg-[#D8EBAE] text-[#709028]',
  hr_message:             'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
};

const DEFAULT_ICON = <Bell size={14} />;
const DEFAULT_ICON_BG = 'bg-gray-100 dark:bg-gray-700 text-gray-500';

export function NotificationDropdown({ notifications, isAr, onMarkAllRead, onMarkRead, onNavigate }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <>
      <style>{`
        @keyframes notif-slide-down {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        .notif-dropdown {
          animation: notif-slide-down 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top center;
        }
        @keyframes notif-dot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(160,205,57,0.5); }
          50%       { box-shadow: 0 0 0 4px rgba(160,205,57,0);  }
        }
        .notif-dot-pulse { animation: notif-dot-pulse 2s ease-in-out infinite; }
      `}</style>

      <div className={`notif-dropdown fixed inset-x-4 top-[4.5rem]
                      sm:absolute sm:inset-x-auto sm:inset-e-0 sm:top-full sm:mt-2 sm:w-80
                      rounded-2xl bg-white dark:bg-gray-800
                      shadow-xl border border-gray-100 dark:border-gray-700
                      z-50 overflow-hidden transition-opacity duration-200
                      ${visible ? 'opacity-100' : 'opacity-0'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5
                        border-b border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-medium text-[#709028] dark:text-[#A0CD39]
                       hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAr ? 'تحديد الكل كـ مقروء' : 'Mark all as read'}
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {isAr ? 'الإشعارات' : 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-[#A0CD39] text-gray-900
                               text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell size={28} className="text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {isAr ? 'لا توجد إشعارات' : 'No notifications'}
              </p>
            </div>
          ) : notifications.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                onMarkRead(n.id);
                onNavigate?.(n);
              }}
              className={`w-full text-start px-4 py-3.5 flex items-start gap-3
                          transition-colors duration-150
                          ${n.readAt
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                            : 'bg-[#D8EBAE]/20 dark:bg-[#D8EBAE]/5 hover:bg-[#D8EBAE]/30 dark:hover:bg-[#D8EBAE]/10'
                          }`}
            >
              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                               ${TYPE_ICON_BG[n.type] ?? DEFAULT_ICON_BG}`}>
                {TYPE_ICON[n.type] ?? DEFAULT_ICON}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug
                                 ${n.readAt
                                   ? 'font-normal text-gray-500 dark:text-gray-400'
                                   : 'font-semibold text-gray-800 dark:text-gray-100'}`}>
                    {n.title}
                  </p>
                  {!n.readAt && (
                    <span className="notif-dot-pulse mt-1.5 w-2 h-2 rounded-full bg-[#A0CD39] shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2">
                  {n.body}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  {formatTimeAgo(n.createdAt, isAr)}
                </p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
