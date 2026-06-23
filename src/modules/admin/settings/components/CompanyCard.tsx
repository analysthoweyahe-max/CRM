import { useForm, Controller } from 'react-hook-form';
import { Building2, Mail, Globe, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox } from '@/shared/components/form/Combobox';

interface CompanyValues {
  name: string;
  email: string;
  timezone: string;
}

const TIMEZONES = [
  { id: 'africa/cairo', label: 'توقيت القاهرة (GMT+2)' },
  { id: 'asia/riyadh', label: 'توقيت الرياض (GMT+3)' },
  { id: 'asia/dubai', label: 'توقيت دبي (GMT+4)' },
  { id: 'utc', label: 'UTC (GMT+0)' },
];

export function CompanyCard({ isAr }: { isAr: boolean; }) {
  const { register, control, handleSubmit, formState: { isSubmitting } } =
    useForm<CompanyValues>({
      defaultValues: { name: 'هوية', email: 'aa436436@gmail.com', timezone: 'africa/cairo' },
    });

  async function onSubmit(data: CompanyValues) {
    await new Promise((r) => setTimeout(r, 500));
    // TODO: await api.put('/settings/company', data)
    console.log('company:', data);
    toast.success(isAr ? 'تم حفظ بيانات الشركة' : 'Company data saved');
  }

  const cbProps = {
    searchPlaceholder: isAr ? 'ابحث...' : 'Search...',
    noResultsText: isAr ? 'لا نتائج' : 'No results',
  };

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
        <FormField
          label={isAr ? 'اسم الشركة' : 'Company Name'}
          icon={<Building2 size={15} className="text-gray-400" />}
        >
          <Input
            {...register('name')}
            endIcon={<Building2 size={15} />}
            placeholder={isAr ? 'اسم الشركة' : 'Company name'}
          />
        </FormField>

        <FormField
          label={isAr ? 'البريد الرسمي' : 'Official Email'}
          icon={<Mail size={15} className="text-gray-400" />}
        >
          <Input
            {...register('email')}
            type="email"
            dir="ltr"
            placeholder="company@example.com"
            endIcon={<Mail size={15} />}
            className={isAr ? 'text-right' : 'text-left'}
          />
        </FormField>

        <FormField
          label={isAr ? 'المنطقة الزمنية' : 'Timezone'}
          icon={<Globe size={15} className="text-gray-400" />}
        >
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Combobox
                items={TIMEZONES}
                value={field.value}
                onChange={field.onChange}
                placeholder={isAr ? 'اختر المنطقة الزمنية' : 'Select timezone'}
                {...cbProps}
              />
            )}
          />
        </FormField>

        <Button type="submit" isLoading={isSubmitting} startIcon={<Check size={15} />}>
          {isAr ? 'حفظ' : 'Save'}
        </Button>
      </form>
    </Card>
  );
}
