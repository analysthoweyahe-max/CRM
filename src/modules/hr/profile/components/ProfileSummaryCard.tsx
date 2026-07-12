import { useRef, useState } from 'react';
import { SquarePen, Trash2, Building2, Briefcase, CalendarDays, Hash } from 'lucide-react';
import { toast } from 'sonner';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { EMPLOYEES } from '@/modules/hr/employees/data/employeeData';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { authService } from '@/modules/auth/services/auth.service';
import { extractApiError } from '@/shared/utils/error.utils';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  admin: { ar: 'مدير النظام', en: 'System Admin' },
  hr: { ar: 'مدير موارد بشرية', en: 'HR Manager' },
  manager: { ar: 'مدير', en: 'Manager' },
  employee: { ar: 'موظف', en: 'Employee' },
};

interface Props {
  user: AuthUser;
  isAr: boolean;
}

export function ProfileSummaryCard({ user, isAr }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const emp = EMPLOYEES.find((e) => e.id === user.employeeId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await authService.uploadAvatar(file);
      await refreshUser();
      toast.success(isAr ? 'تم تحديث الصورة الشخصية' : 'Profile photo updated');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  async function handleRemovePhoto() {
    setIsRemoving(true);
    try {
      await authService.deleteAvatar();
      await refreshUser();
      toast.success(isAr ? 'تم حذف الصورة الشخصية' : 'Profile photo removed');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsRemoving(false);
    }
  }

  const initial = user.fullName.slice(0, 1).toUpperCase();
  const roleLabel = ROLE_LABELS[user.role]?.[isAr ? 'ar' : 'en'] ?? user.role;
  const avatarBg = emp?.avatarBg ?? 'bg-[#A0CD39]';

  const infoRows = [
    {
      icon: <Building2 size={15} />,
      label: isAr ? 'القسم' : 'Department',
      value: isAr ? (emp?.department ?? '—') : (emp?.deptEn ?? '—'),
    },
    {
      icon: <Briefcase size={15} />,
      label: isAr ? 'نوع التوظيف' : 'Employment Type',
      value: isAr ? 'دوام كامل' : 'Full Time',
    },
    {
      icon: <CalendarDays size={15} />,
      label: isAr ? 'تاريخ الانضمام' : 'Hire Date',
      value: emp?.hireDate ?? '—',
    },
    {
      icon: <Hash size={15} />,
      label: isAr ? 'المعرف' : 'ID',
      value: emp?.id ?? user.employeeId ?? '—',
    },
  ];

  return (
    <Card padding="lg" className="flex flex-col items-center text-center gap-4">

      {/* Avatar */}
      <div className="relative mt-2">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className={`w-20 h-20 rounded-full ${avatarBg}
                          flex items-center justify-center`}>
            <span className="text-2xl font-bold text-white">{initial}</span>
          </div>
        )}
      </div>

      {/* Name & role */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{user.fullName}</h2>
        <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">{roleLabel}</p>
      </div>

      {/* Change / remove photo buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                     border border-gray-200 dark:border-gray-600
                     text-gray-600 dark:text-gray-400
                     hover:border-[#A0CD39] hover:text-[#709028] transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <SquarePen size={14} />
          {isUploading
            ? (isAr ? 'جارٍ الرفع...' : 'Uploading...')
            : (isAr ? 'تغيير الصورة' : 'Change Photo')}
        </button>

        {user.avatarUrl && (
          <Button
            type="button"
            variant="icon-danger"
            isLoading={isRemoving}
            onClick={handleRemovePhoto}
            title={isAr ? 'حذف الصورة' : 'Remove photo'}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Divider */}
      <div className="w-full h-px" style={{ background: '#D8EBAE' }} />

      {/* Info grid */}
      <div className="w-full space-y-3 text-start">
        {infoRows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">
              {row.value}
            </span>
            <div className="flex items-center gap-1.5 shrink-0 text-gray-500 dark:text-gray-400">
              <span className="text-xs">{row.label}</span>
              <span style={{ color: '#709028' }}>{row.icon}</span>
            </div>
          </div>
        ))}
      </div>

    </Card>
  );
}
