import { useEffect } from 'react';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ContractUploadCard } from '@/shared/components/upload/ContractUploadCard';

interface Props {
  user: AuthUser;
  isAr: boolean;
}

export function ProfileContractTab({ user, isAr }: Props) {
  const { refreshUser } = useAuth();

  // Pick up a contract HR/super-admin may have just uploaded, without a full re-login.
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5 pt-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isAr
          ? 'يمكنك تحميل نسخة من عقد عملك بصيغة PDF أو صورة.'
          : 'You can download a copy of your employment contract as a PDF or image.'}
      </p>

      <ContractUploadCard
        contract={user.contract ?? null}
        isUploading={false}
        isAr={isAr}
        canManage={false}
      />
    </div>
  );
}
