import { useState }    from 'react';
import { useForm }     from 'react-hook-form';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
import { toast }       from 'sonner';
import { Modal }       from '@/shared/components/ui/Modal';
import { Input }       from '@/shared/components/ui/Input';
import { Button }      from '@/shared/components/ui/Button';
import { FormField }   from '@/shared/components/form/FormField';

interface ChangePasswordValues {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}

interface Props {
  open:    boolean;
  onClose: () => void;
  isAr:    boolean;
}

/* ── Password field with eye toggle ─────────────────── */
function PwdField({
  label, required, error, ...inputProps
}: {
  label:      string;
  required?:  boolean;
  error?:     string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} required={required} error={error}>
      <div className="relative">
        <Input
          {...inputProps}
          type={visible ? 'text' : 'password'}
          startIcon={<Lock size={15} />}
          className="pe-10"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 inset-e-3 flex items-center
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                     transition-colors"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </FormField>
  );
}

/* ── Modal ───────────────────────────────────────────── */
export function ChangePasswordModal({ open, onClose, isAr }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>();

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(data: ChangePasswordValues) {
    await new Promise((r) => setTimeout(r, 600));
    // TODO: await api.post('/auth/change-password', data)
    console.log('change password:', data);
    toast.success(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
    handleClose();
  }

  const newPwd = watch('newPassword');

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'تغيير كلمة المرور' : 'Change Password'}
      description={isAr ? 'حدّث كلمة مرور حسابك' : 'Update your account password'}
      size="md"
      footer={
        <Button
          type="submit"
          form="change-pwd-form"
          isLoading={isSubmitting}
          startIcon={<Check size={15} />}
        >
          {isAr ? 'تحديث' : 'Update'}
        </Button>
      }
    >
      <form id="change-pwd-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        <PwdField
          label={isAr ? 'كلمة المرور الحالية' : 'Current Password'}
          required
          error={errors.currentPassword?.message}
          {...register('currentPassword', {
            required: isAr ? 'كلمة المرور الحالية مطلوبة' : 'Current password is required',
          })}
        />

        <PwdField
          label={isAr ? 'كلمة المرور الجديدة' : 'New Password'}
          required
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required:  isAr ? 'كلمة المرور الجديدة مطلوبة' : 'New password is required',
            minLength: {
              value:   8,
              message: isAr ? 'يجب أن تكون 8 أحرف على الأقل' : 'Minimum 8 characters',
            },
          })}
        />

        <PwdField
          label={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: isAr ? 'تأكيد كلمة المرور مطلوب' : 'Please confirm your password',
            validate: (v) =>
              v === newPwd ||
              (isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'),
          })}
        />

      </form>
    </Modal>
  );
}
