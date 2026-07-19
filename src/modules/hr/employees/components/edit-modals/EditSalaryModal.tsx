import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DollarSign, Wallet } from 'lucide-react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import { employeeApi } from '../../api/employee.api';
import { CURRENCIES, resolveCurrency } from '../NewEmployeeForm/newEmployeeForm.types';

interface Props {
  open:       boolean;
  onClose:    () => void;
  employeeId: string;
  current:    number | null | undefined;
  currency?:  string | null;
  isAr:       boolean;
}

export function EditSalaryModal({ open, onClose, employeeId, current, currency, isAr }: Props) {
  const queryClient = useQueryClient();
  const currencyValue = resolveCurrency(currency);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      salary:   String(current ?? ''),
      currency: currencyValue,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      salary:   String(current ?? ''),
      currency: resolveCurrency(currency),
    });
  }, [open, current, currency, reset]);

  const mutation = useMutation({
    mutationFn: (data: { salary: number; currency: string }) =>
      employeeApi.updateSalary(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isAr ? 'تم تحديث الراتب' : 'Salary updated');
      onClose();
    },
    onError: () => toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Failed to save'),
  });

  function onSubmit(data: { salary: string; currency: string }) {
    const salary = parseFloat(data.salary);
    if (!salary || salary <= 0) return;
    if (salary === (current ?? 0) && data.currency === currencyValue) {
      onClose();
      return;
    }
    mutation.mutate({ salary, currency: data.currency });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل الراتب الأساسي' : 'Edit Basic Salary'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button isLoading={mutation.isPending} onClick={handleSubmit(onSubmit)}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
        </>
      }
    >
      <FormField label={isAr ? 'الراتب الأساسي' : 'Basic Salary'}>
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <Input
              {...register('salary')}
              type="number"
              min={0}
              endIcon={<Wallet size={15} />}
              placeholder="0"
            />
          </div>
          <div className="w-32 shrink-0">
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Combobox
                  items={CURRENCIES}
                  value={field.value ?? 'EGP'}
                  onChange={field.onChange}
                  triggerShowsDetail={false}
                  searchPlaceholder={isAr ? 'ابحث عن عملة...' : 'Search currency...'}
                  noResultsText={isAr ? 'لا نتائج' : 'No results'}
                />
              )}
            />
          </div>
        </div>
      </FormField>
      {/* keep DollarSign import used for a11y/visual parity if tree-shaken — reference via noop */}
      <span className="sr-only"><DollarSign size={1} /></span>
    </Modal>
  );
}
