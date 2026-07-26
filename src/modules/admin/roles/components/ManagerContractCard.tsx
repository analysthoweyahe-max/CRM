import { toast } from 'sonner';
import { Card } from '@/shared/components/ui/Card';
import { ContractUploadCard } from '@/shared/components/upload/ContractUploadCard';
import { extractContractUploadError } from '@/shared/utils/contractFile.utils';
import type { ApiAdminManager } from '../types/adminManager.types';
import { useUploadManagerContract, useRemoveManagerContract } from '../hooks/useManagerContract';

interface Props {
  manager: ApiAdminManager;
  isAr:    boolean;
}

export function ManagerContractCard({ manager, isAr }: Props) {
  const uploadMutation = useUploadManagerContract(manager.id);
  const removeMutation = useRemoveManagerContract(manager.id);

  function handleUpload(file: File) {
    uploadMutation.mutate(file, {
      onSuccess: () => toast.success(isAr ? 'تم رفع العقد' : 'Contract uploaded'),
      onError: (err) => toast.error(extractContractUploadError(err)),
    });
  }

  function handleRemove() {
    removeMutation.mutate(undefined, {
      onSuccess: () => toast.success(isAr ? 'تم حذف العقد' : 'Contract removed'),
      onError: (err) => toast.error(extractContractUploadError(err)),
    });
  }

  return (
    <Card padding="lg" className="space-y-2">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
        {isAr ? 'عقد العمل' : 'Employment Contract'}
      </h2>
      <ContractUploadCard
        contract={manager.contract ?? null}
        onUploadFile={handleUpload}
        onRemove={handleRemove}
        isUploading={uploadMutation.isPending}
        isRemoving={removeMutation.isPending}
        isAr={isAr}
        uploadError={uploadMutation.isError ? extractContractUploadError(uploadMutation.error) : null}
        canManage
      />
    </Card>
  );
}
