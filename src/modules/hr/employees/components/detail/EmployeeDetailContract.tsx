import { toast } from 'sonner';
import { ContractUploadCard } from '@/shared/components/upload/ContractUploadCard';
import { extractContractUploadError } from '@/shared/utils/contractFile.utils';
import type { ContractFile } from '@/shared/types/contract.types';
import { useUploadEmployeeContract, useRemoveEmployeeContract } from '../../hooks/useEmployeeContract';

interface Props {
  employeeId: string;
  contract:   ContractFile | null;
  isAr:       boolean;
  /** true for super-admin/HR (write access); false for PM/SEO-leader (view + download only). */
  canManage:  boolean;
}

export function EmployeeDetailContract({ employeeId, contract, isAr, canManage }: Props) {
  const uploadMutation = useUploadEmployeeContract(employeeId);
  const removeMutation = useRemoveEmployeeContract(employeeId);

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
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
        {isAr ? 'عقد العمل' : 'Employment Contract'}
      </h3>
      <ContractUploadCard
        contract={contract}
        onUploadFile={canManage ? handleUpload : undefined}
        onRemove={canManage ? handleRemove : undefined}
        isUploading={uploadMutation.isPending}
        isRemoving={removeMutation.isPending}
        isAr={isAr}
        uploadError={uploadMutation.isError ? extractContractUploadError(uploadMutation.error) : null}
        canManage={canManage}
      />
    </div>
  );
}
