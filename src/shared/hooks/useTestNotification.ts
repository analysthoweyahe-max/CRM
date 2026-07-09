import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLang } from '@/app/providers/LanguageProvider';
import { notificationsApi } from '@/shared/services/notifications.service';
import { extractApiError } from '@/shared/utils/error.utils';

/** Dev/QA helper — POST /notifications/test to verify FCM + database delivery. */
export function useTestNotification() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return useMutation({
    mutationFn: () => notificationsApi.test({
      title: isAr ? 'إشعار تجريبي' : 'Test notification',
      body:  isAr ? 'اختبار فوري من الواجهة الأمامية' : 'Real-time test from frontend',
    }),
    onSuccess: (res) => {
      const { fcmRegistered, channels } = res.data.data;
      const viaFcm = fcmRegistered && channels.includes('fcm');

      toast.success(
        isAr ? 'تم إرسال الإشعار التجريبي' : 'Test notification sent',
        {
          description: viaFcm
            ? (isAr ? 'يجب أن يصل فوراً عبر FCM' : 'Should arrive instantly via FCM')
            : (isAr ? 'مسجل في القائمة فقط — FCM غير مسجل' : 'In-app list only — FCM not registered'),
        },
      );
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}
