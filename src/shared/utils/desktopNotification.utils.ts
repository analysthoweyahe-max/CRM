/** Request browser/OS notification permission (no-op if already decided or unsupported). */
export async function ensureDesktopNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

interface DesktopNotificationOptions {
  title: string;
  body:  string;
  tag?:  string;
  onClick?: () => void;
}

/**
 * Show a Windows/OS desktop notification when permission is granted.
 * Returns false when unsupported, denied, or the call fails.
 */
export function showDesktopNotification(options: DesktopNotificationOptions): boolean {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const n = new Notification(options.title, {
      body: options.body,
      tag:  options.tag,
      silent: false,
    });
    n.onclick = () => {
      try {
        window.focus();
      } catch { /* ignore */ }
      options.onClick?.();
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}
