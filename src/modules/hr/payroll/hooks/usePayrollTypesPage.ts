import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import {
  useBonusTypesAdmin,
  useDeductionTypesAdmin,
  useCreateBonusType,
  useUpdateBonusType,
  useDeleteBonusType,
  useCreateDeductionType,
  useUpdateDeductionType,
  useDeleteDeductionType,
} from './usePayrollTypes';
import type { ApiPayrollAdjustmentType, CreatePayrollTypePayload } from '../types/payroll.types';

export type PayrollTypesTab = 'bonus' | 'deduction';

export function usePayrollTypesPage(isAr: boolean) {
  const [tab, setTab] = useState<PayrollTypesTab>('bonus');

  const bonusQuery     = useBonusTypesAdmin();
  const deductionQuery = useDeductionTypesAdmin();

  const createBonus     = useCreateBonusType();
  const updateBonus     = useUpdateBonusType();
  const deleteBonus     = useDeleteBonusType();
  const createDeduction = useCreateDeductionType();
  const updateDeduction = useUpdateDeductionType();
  const deleteDeduction = useDeleteDeductionType();

  const [showAdd,       setShowAdd]       = useState(false);
  const [editing,       setEditing]       = useState<ApiPayrollAdjustmentType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApiPayrollAdjustmentType | null>(null);

  const isBonus = tab === 'bonus';
  const items   = isBonus ? (bonusQuery.data ?? []) : (deductionQuery.data ?? []);
  const isLoading = isBonus ? bonusQuery.isLoading : deductionQuery.isLoading;
  const creating  = isBonus ? createBonus.isPending : createDeduction.isPending;
  const updating  = isBonus ? updateBonus.isPending : updateDeduction.isPending;
  const deleting  = isBonus ? deleteBonus.isPending : deleteDeduction.isPending;

  function submitAdd(payload: CreatePayrollTypePayload) {
    const mutate = isBonus ? createBonus.mutate : createDeduction.mutate;
    mutate(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء النوع' : 'Type created');
        setShowAdd(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function submitEdit(payload: CreatePayrollTypePayload) {
    if (!editing) return;
    const mutate = isBonus ? updateBonus.mutate : updateDeduction.mutate;
    mutate({ id: editing.id, payload }, {
      onSuccess: () => {
        toast.success(isAr ? 'تم تحديث النوع' : 'Type updated');
        setEditing(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function confirmDelete() {
    if (!pendingDelete || pendingDelete.isSystem) return;
    const mutate = isBonus ? deleteBonus.mutate : deleteDeduction.mutate;
    mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(isAr ? 'تم حذف النوع' : 'Type deleted');
        setPendingDelete(null);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  return {
    tab, setTab,
    items, isLoading,
    showAdd, openAdd: () => setShowAdd(true), closeAdd: () => setShowAdd(false),
    submitAdd, creating,
    editing, openEdit: setEditing, closeEdit: () => setEditing(null),
    submitEdit, updating,
    pendingDelete,
    askDelete: (item: ApiPayrollAdjustmentType) => {
      if (item.isSystem) {
        toast.error(isAr ? 'لا يمكن حذف الأنواع النظامية' : 'System types cannot be deleted');
        return;
      }
      setPendingDelete(item);
    },
    cancelDelete: () => setPendingDelete(null),
    confirmDelete, deleting,
  };
}
