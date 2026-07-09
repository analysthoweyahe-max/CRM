import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Key, Lock } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import {
  setPasswordSchema,
  type SetPasswordFormValues,
} from '@/modules/auth/schemas/setPassword.schema';
import { authTranslations } from '@/modules/auth/i18n';

interface Props {
  open:      boolean;
  employee?: { name: string; email: string };
  isAr:      boolean;
  isLoading: boolean;
  onClose:   () => void;
  onSubmit:  (payload: { password: string; password_confirmation: string }) => void;
}

function PasswordField({
  label,
  error,
  valueProps,
  isVisible,
  onToggle,
}: {
  label:      string;
  error?:     string;
  valueProps: React.InputHTMLAttributes<HTMLInputElement>;
  isVisible:  boolean;
  onToggle:   () => void;
}) {
  return (
    <FormField label={label} required error={error}>
      <div className="relative">
        <Input
          {...valueProps}
          type={isVisible ? 'text' : 'password'}
          startIcon={<Lock size={15} />}
          className="pe-10"
          autoComplete="new-password"
          dir="ltr"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          className="absolute inset-y-0 inset-e-3 flex items-center
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                     transition-colors"
        >
          {isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </FormField>
  );
}

export function UpdateEmployeePasswordModal({
  open,
  employee,
  isAr,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const v = authTranslations[isAr ? 'ar' : 'en'].validation;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  function handleClose() {
    reset();
    setShowPassword(false);
    setShowConfirm(false);
    onClose();
  }

  function submit(data: SetPasswordFormValues) {
    onSubmit({
      password:              data.password,
      password_confirmation: data.confirmPassword,
    });
  }

  const fieldErr = (msg: string | undefined) =>
    msg ? (v[msg as keyof typeof v] ?? msg) : undefined;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'تغيير كلمة مرور الموظف' : 'Update Employee Password'}
      description={
        employee
          ? (isAr
            ? `تعيين كلمة مرور جديدة لـ ${employee.name} (${employee.email})`
            : `Set a new password for ${employee.name} (${employee.email})`)
          : undefined
      }
      size="md"
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button
            type="submit"
            form="update-employee-password-form"
            isLoading={isLoading}
            startIcon={<Key size={15} />}
          >
            {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
          </Button>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <form
        id="update-employee-password-form"
        onSubmit={handleSubmit(submit)}
        noValidate
        className="space-y-4"
      >
        <PasswordField
          label={isAr ? 'كلمة المرور الجديدة' : 'New Password'}
          error={fieldErr(errors.password?.message)}
          valueProps={register('password')}
          isVisible={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
        />

        <PasswordField
          label={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
          error={fieldErr(errors.confirmPassword?.message)}
          valueProps={register('confirmPassword')}
          isVisible={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
        />
      </form>
    </Modal>
  );
}
