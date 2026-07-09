import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, Bell, Globe, LogOut, User, ChevronDown, Moon, Sun, KeyRound } from 'lucide-react';
import { ChangePasswordModal }        from '@/modules/auth/components/ChangePasswordModal';
import { useAuth }                    from '@/modules/auth/context/AuthContext';
import { useLang }                    from '@/app/providers/LanguageProvider';
import { useTheme }                   from '@/app/providers/ThemeProvider';
import { ROUTES }                     from '@/app/router/routes';
import { UserRoleBadges }             from '@/shared/components/auth';
import { useFirebaseMessaging }       from '@/shared/hooks/useFirebaseMessaging';
import { useNotifications }           from '@/shared/hooks/useNotifications';
import { NotificationDropdown }       from './NotificationDropdown';
import { resolveNotificationPath }    from '@/shared/utils/notificationNavigation.utils';
import { playNotificationSound }      from '@/shared/utils/sound.utils';
import { useEmployeeAlertList }       from '@/modules/employee/alerts/hooks/useEmployeeAlerts';
import type { AppNotification }     from '@/shared/types/notification.types';

interface TopbarProps {
  onMenuToggle:  () => void;
  profileRoute?: string;
}

export function Topbar({ onMenuToggle, profileRoute = ROUTES.PROFILE }: TopbarProps) {
  const { user, logout }        = useAuth();
  const { lang, toggleLang }    = useLang();
  const { isDark, toggleTheme } = useTheme();
  const navigate                = useNavigate();
  const qc                      = useQueryClient();
  const isAr = lang === 'ar';

  const [open,          setOpen]          = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);

  const { notifications, unreadCount, justArrived, markRead, markAllRead, refetch } = useNotifications();
  const [ringing, setRinging] = useState(false);

  useEffect(() => {
    if (justArrived === 0) return; // initial value, not a real arrival
    setRinging(true);
    const t = setTimeout(() => setRinging(false), 700);
    return () => clearTimeout(t);
  }, [justArrived]);

  // "Alerts" (management instructions) are a separate feed from regular
  // notifications, but a new one should still chime + shake the same bell.
  const isEmployee = user?.role === 'employee';
  const { data: alertsData } = useEmployeeAlertList(isEmployee);
  const unreadAlertsCount = (alertsData?.data ?? []).filter(a => !a.readAt).length;
  const prevUnreadAlertsCount = useRef<number | null>(null);

  useEffect(() => {
    if (!isEmployee) return;
    const prev = prevUnreadAlertsCount.current;
    prevUnreadAlertsCount.current = unreadAlertsCount;
    if (prev === null || unreadAlertsCount <= prev) return;

    playNotificationSound();
    setRinging(true);
    const t = setTimeout(() => setRinging(false), 700);
    return () => clearTimeout(t);
  }, [unreadAlertsCount, isEmployee]);

  function handlePushRefresh() {
    refetch();
    qc.invalidateQueries({ queryKey: ['my-tasks'] });
  }

  // Alerts have no `type`/`data` shape of their own — recast them as
  // notifications (prefixed id) so they render in the same dropdown/badge.
  const alertNotifications: AppNotification[] = (alertsData?.data ?? []).map(a => ({
    id:        `alert-${a.id}`,
    type:      'alert',
    title:     a.title,
    body:      a.body,
    readAt:    a.readAt,
    createdAt: a.createdAt,
  }));

  const mergedNotifications = [...notifications, ...alertNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const mergedUnreadCount = unreadCount + unreadAlertsCount;

  function handleNotificationClick(notification: AppNotification) {
    if (notification.type === 'alert') {
      const alertId = notification.id.replace(/^alert-/, '');
      navigate(ROUTES.EMPLOYEE.ALERT_DETAIL(alertId));
      // Backend marks the alert read when its detail is fetched — refresh
      // shortly after so the badge/list catch up without waiting for the poll.
      setTimeout(() => qc.invalidateQueries({ queryKey: ['employee', 'alerts'] }), 500);
      setNotifOpen(false);
      return;
    }
    const path = resolveNotificationPath(notification, user);
    if (path) navigate(path);
    setNotifOpen(false);
  }

  function handleMarkRead(id: string) {
    if (id.startsWith('alert-')) return; // alerts are marked read by opening their detail page
    markRead(id);
  }

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  // Foreground FCM push arrived — refetch the real list instead of trusting the payload
  useFirebaseMessaging(handlePushRefresh);

  // Close dropdowns on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const initial   = user?.fullName?.slice(0, 1).toUpperCase() ?? '?';

  return (
    <>
    <header className="sticky top-0 z-10 h-16 flex items-center gap-3 px-4 md:px-6
                       bg-white dark:bg-gray-900
                       border-b border-gray-100 dark:border-gray-700/60">

      {/* Greeting + hamburger */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:flex flex-col leading-snug">
          <span className="flex items-center gap-1"
            style={{ fontSize: '12px', fontWeight: 400, color: '#595959' }}>
            {isAr ? 'مرحباً بعودتك' : 'Welcome back'}
            <span style={{ color: '#A0CD39', fontSize: '14px' }}>👋</span>
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
            {user?.fullName ?? ''}
          </span>
          <UserRoleBadges className="mt-0.5" />
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">

        {/* ── Bell / Notifications ── */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => { setNotifOpen(p => !p); setOpen(false); }}
            className={`relative p-2 rounded-lg transition-colors
                        ${notifOpen
                          ? 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 text-[#709028]'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Bell size={18} className={ringing ? 'animate-bell-ring' : ''} />
            {mergedUnreadCount > 0 && (
              <span className="absolute top-1 inset-e-1 min-w-4 h-4 px-0.5 rounded-full
                               bg-red-500 text-white text-[10px] font-bold
                               flex items-center justify-center leading-none">
                {mergedUnreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationDropdown
              notifications={mergedNotifications}
              isAr={isAr}
              onMarkAllRead={markAllRead}
              onMarkRead={handleMarkRead}
              onNavigate={handleNotificationClick}
            />
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <span className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => { setOpen(p => !p); setNotifOpen(false); }}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#A0CD39] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-gray-900">{initial}</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 dark:text-gray-500 transition-transform duration-200
                          ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="absolute inset-e-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl bg-white dark:bg-gray-800
                            shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">

              <div className="flex items-center gap-3 px-4 py-3
                              border-b border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-[#A0CD39]
                                flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gray-900">{initial}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.fullName}
                  </p>
                  <div className="mt-1">
                    <UserRoleBadges size="md" />
                  </div>
                </div>
              </div>

              <button type="button"
                onClick={() => { navigate(profileRoute); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <User size={16} className="text-gray-400 shrink-0" />
                <span>{isAr ? 'الملف الشخصي' : 'Profile'}</span>
              </button>

              <button type="button"
                onClick={() => { setShowChangePwd(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <KeyRound size={16} className="text-gray-400 shrink-0" />
                <span>{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</span>
              </button>

              <button type="button"
                onClick={() => { toggleLang(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <Globe size={16} className="text-gray-400 shrink-0" />
                <span>{isAr ? 'تغيير اللغة' : 'Change Language'}</span>
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

              <button type="button"
                onClick={async () => { await logout(); navigate(ROUTES.AUTH.LOGIN); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut size={16} className="shrink-0" />
                <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>

            </div>
          )}
        </div>

      </div>
    </header>

    <ChangePasswordModal
      open={showChangePwd}
      onClose={() => setShowChangePwd(false)}
      isAr={isAr}
    />
    </>
  );
}
