import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Building2, Mail, Globe, Check } from 'lucide-react';
import { toast }       from 'sonner';
import { Card }        from '@/shared/components/ui/Card';
import { Input }       from '@/shared/components/ui/Input';
import { Button }      from '@/shared/components/ui/Button';
import { FormField }   from '@/shared/components/form/FormField';
import { Combobox }    from '@/shared/components/form/Combobox';
import { useSettings, useUpdateSetting } from '../hooks/useSettings';

interface CompanyValues { name: string; email: string; timezone: string; }

const TIMEZONES = [
  { id: 'africa/cairo', label: 'توقيت القاهرة (GMT+2)' },
  { id: 'asia/riyadh',  label: 'توقيت الرياض (GMT+3)'  },
  { id: 'asia/dubai',   label: 'توقيت دبي (GMT+4)'      },
  { id: 'utc',          label: 'UTC (GMT+0)'              },
];

export function CompanyCard({ isAr }: { isAr: boolean }) {
  const { data: settings }           = useSettings();
  const { mutateAsync: updateSetting } = useUpdateSetting();

  const { register, control, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<CompanyValues>({ defaultValues: { name: '', email: '', timezone: 'africa/cairo' } });

  useEffect(() => {
    if (!settings) return;
    reset({
      name:     String(settings.app_name  ?? ''),
      email:    String(settings.app_email ?? ''),
      timezone: String(settings.timezone  ?? 'africa/cairo'),
    });
  }, [settings, reset]);

  async function onSubmit(data: CompanyValues) {
    await Promise.all([
      updateSetting({ key: 'app_name',  value: data.name     }),
      updateSetting({ key: 'app_email', value: data.email    }),
      updateSetting({ key: 'timezone',  value: data.timezone }),
    ]);
    toast.success(isAr ? 'تم حفظ بيانات الشركة' : 'Company data saved');
  }

  const cbProps = { searchPlaceholder: isAr ? 'ابحث...' : 'Search...', noResultsText: isAr ? 'لا نتائج' : 'No results' };

  return (
    <Card padding="lg">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'بيانات الشركة' : 'Company Data'}
        </h2>
        <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
          {isAr ? 'المعلومات الأساسية' : 'Basic information'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label={isAr ? 'اسم الشركة' : 'Company Name'} icon={<Building2 size={15} className="text-gray-400" />}>
          <Input {...register('name')} endIcon={<Building2 size={15} />} placeholder={isAr ? 'اسم الشركة' : 'Company name'} />
        </FormField>

        <FormField label={isAr ? 'البريد الرسمي' : 'Official Email'} icon={<Mail size={15} className="text-gray-400" />}>
          <Input {...register('email')} type="email" dir="ltr" placeholder="company@example.com"
            endIcon={<Mail size={15} />} className={isAr ? 'text-right' : 'text-left'} />
        </FormField>

        <FormField label={isAr ? 'المنطقة الزمنية' : 'Timezone'} icon={<Globe size={15} className="text-gray-400" />}>
          <Controller name="timezone" control={control} render={({ field }) => (
            <Combobox items={TIMEZONES} value={field.value} onChange={field.onChange}
              placeholder={isAr ? 'اختر المنطقة الزمنية' : 'Select timezone'} {...cbProps} />
          )} />
        </FormField>

        <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={15} />}>
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </form>
    </Card>
  );
}
