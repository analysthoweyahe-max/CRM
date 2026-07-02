import { useState } from 'react';
import { Modal }     from '@/shared/components/ui/Modal';
import { Button }    from '@/shared/components/ui/Button';
import { Input }     from '@/shared/components/ui/Input';
import { FormField } from '@/shared/components/form/FormField';
import { Combobox }  from '@/shared/components/form/Combobox';
import type { NewAdminEmployeeInput } from '../types/adminEmployee.types';

const ROLE_ITEMS = [
  { id: 'موظف',        label: 'موظف'        },
  { id: 'مدير مشاريع', label: 'مدير مشاريع' },
  { id: 'HR',           label: 'HR'          },
];

const STATUS_ITEMS = [
  { id: 'نشط',  label: 'نشط'  },
  { id: 'معطل', label: 'معطل' },
];

const MANAGER_ITEMS = [
  { id: '',  label: 'بدون مدير مباشر' },
  { id: '1', label: 'أحمد المنصور'    },
  { id: '2', label: 'منى الشريف'      },
];

interface Props {
  open:              boolean;
  onClose:           () => void;
  departmentOptions: string[];
  onSubmit:          (input: NewAdminEmployeeInput) => void;
  isAr:              boolean;
}

const EMPTY: NewAdminEmployeeInput = {
  fullName: '', email: '', phone: '', address: '',
  jobTitle: '', department: '', managerId: '', joiningDate: '',
  role: 'موظف', accountStatus: 'نشط',
};

export function AddEmployeeModal({ open, onClose, departmentOptions, onSubmit, isAr }: Props) {
  const [form, setForm] = useState<NewAdminEmployeeInput>(EMPTY);

  function set<K extends keyof NewAdminEmployeeInput>(key: K, value: NewAdminEmployeeInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const isValid = !!(form.fullName.trim() && form.email.trim() && form.jobTitle.trim());

  function handleSubmit() {
    if (!isValid) return;
    onSubmit(form);
    setForm(EMPTY);
  }

  function handleClose() {
    setForm(EMPTY);
    onClose();
  }

  const departmentItems = departmentOptions.map(d => ({ id: d, label: d }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'إضافة موظف' : 'Add Employee'}
      size="lg"
      footer={
        <div className="flex items-center gap-3 justify-start flex-row-reverse">
          <Button variant="primary" disabled={!isValid} onClick={handleSubmit}>
            {isAr ? 'حفظ' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-1">

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'المعلومات الشخصية' : 'Personal Information'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={isAr ? 'الاسم الكامل' : 'Full Name'} required>
              <Input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                placeholder={isAr ? 'الاسم الكامل' : 'Full name'} />
            </FormField>
            <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="name@howeyah.com" />
            </FormField>
            <FormField label={isAr ? 'رقم الهاتف' : 'Phone Number'}>
              <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+966 5x xxx xxxx" dir="ltr" />
            </FormField>
            <FormField label={isAr ? 'العنوان' : 'Address'}>
              <Input value={form.address} onChange={e => set('address', e.target.value)}
                placeholder={isAr ? 'العنوان' : 'Address'} />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'معلومات التوظيف' : 'Employment Information'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={isAr ? 'القسم' : 'Department'}>
              <Combobox
                items={departmentItems}
                value={form.department}
                onChange={v => set('department', v)}
                placeholder={isAr ? 'اختر القسم' : 'Select department'}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'}
              />
            </FormField>
            <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} required>
              <Input value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)}
                placeholder={isAr ? 'المسمى الوظيفي' : 'Job title'} />
            </FormField>
            <FormField label={isAr ? 'المدير المباشر' : 'Direct Manager'}>
              <Combobox
                items={MANAGER_ITEMS}
                value={form.managerId}
                onChange={v => set('managerId', v)}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'}
              />
            </FormField>
            <FormField label={isAr ? 'تاريخ الالتحاق' : 'Joining Date'}>
              <Input type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isAr ? 'الوصول للنظام' : 'System Access'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={isAr ? 'حالة الحساب' : 'Account Status'}>
              <Combobox
                items={STATUS_ITEMS}
                value={form.accountStatus}
                onChange={v => set('accountStatus', v)}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'}
              />
            </FormField>
            <FormField label={isAr ? 'الدور' : 'Role'}>
              <Combobox
                items={ROLE_ITEMS}
                value={form.role}
                onChange={v => set('role', v)}
                searchPlaceholder={isAr ? 'ابحث...' : 'Search...'}
                noResultsText={isAr ? 'لا نتائج' : 'No results'}
              />
            </FormField>
          </div>
        </div>

      </div>
    </Modal>
  );
}
