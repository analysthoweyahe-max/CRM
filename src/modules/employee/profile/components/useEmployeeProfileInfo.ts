import { useState }  from 'react';
import { toast }     from 'sonner';
import { useAuth }   from '@/modules/auth/context/AuthContext';
import { EMPLOYEES } from '@/modules/hr/employees/data/employeeData';

export function useEmployeeProfileInfo(isAr: boolean) {
  const { user } = useAuth();
  const emp      = EMPLOYEES.find(e => e.id === user?.employeeId);

  const [name,    setName]    = useState(user?.fullName ?? '');
  const [email,   setEmail]   = useState(emp?.email    ?? '');
  const [phone,   setPhone]   = useState(emp?.phone    ?? '');
  const [saving,  setSaving]  = useState(false);

  const jobTitle  = isAr ? (emp?.jobTitle   ?? '') : (emp?.jobTitleEn ?? '');
  const dept      = isAr ? (emp?.department ?? '') : (emp?.deptEn     ?? '');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise<void>(r => setTimeout(r, 500));
    setSaving(false);
    toast.success(isAr ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
  }

  return { name, setName, email, setEmail, phone, setPhone, jobTitle, dept, saving, handleSave };
}
