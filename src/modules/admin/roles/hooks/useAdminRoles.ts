import { useState } from 'react';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { INITIAL_ROLES, INITIAL_MATRIX } from '../data/roleData';
import { useCreateAdmin } from './useCreateAdmin';
import type { RoleDef, PermissionMatrix, PermissionAction, RoleFormInput } from '../types/adminRole.types';
import type { CreateAdminPayload } from '../types/adminManager.types';

export function useAdminRoles(isAr: boolean) {
  const [roles,       setRoles]       = useState<RoleDef[]>(INITIAL_ROLES);
  const [matrix,       setMatrix]      = useState<PermissionMatrix>(INITIAL_MATRIX);
  const [editingRole,  setEditingRole] = useState<RoleDef | null>(null);
  const [showModal,    setShowModal]   = useState(false);

  const [showManagerModal, setShowManagerModal] = useState(false);
  const { mutate: createAdmin, isPending: creatingManager } = useCreateAdmin();

  function submitManager(payload: CreateAdminPayload) {
    createAdmin(payload, {
      onSuccess: () => {
        toast.success(isAr ? 'تم إنشاء المدير' : 'Manager created');
        setShowManagerModal(false);
      },
      onError: (err) => toast.error(extractApiError(err)),
    });
  }

  function toggleMatrixPermission(roleKey: string, moduleKey: string, action: PermissionAction) {
    setMatrix(prev => {
      const current = prev[roleKey]?.[moduleKey] ?? [];
      const next = current.includes(action) ? current.filter(a => a !== action) : [...current, action];
      return { ...prev, [roleKey]: { ...prev[roleKey], [moduleKey]: next } };
    });
  }

  function openCreate()          { setEditingRole(null); setShowModal(true); }
  function openEdit(role: RoleDef) { setEditingRole(role); setShowModal(true); }
  function closeModal()          { setShowModal(false); }

  function submitRole(input: RoleFormInput) {
    if (editingRole) {
      setRoles(prev => prev.map(r => r.key === editingRole.key
        ? { ...r, nameAr: input.nameAr, nameEn: input.nameAr, descriptionAr: input.descriptionAr, descriptionEn: input.descriptionAr }
        : r));
      setMatrix(prev => ({ ...prev, [editingRole.key]: input.permissions }));
      toast.success(isAr ? 'تم تحديث الدور' : 'Role updated');
    } else {
      const key = `role_${Date.now()}`;
      setRoles(prev => [...prev, {
        key, nameAr: input.nameAr, nameEn: input.nameAr,
        descriptionAr: input.descriptionAr, descriptionEn: input.descriptionAr, usersCount: 0,
      }]);
      setMatrix(prev => ({ ...prev, [key]: input.permissions }));
      toast.success(isAr ? 'تم إنشاء الدور' : 'Role created');
    }
    setShowModal(false);
  }

  const matrixRoles = roles.filter(r => !r.isSystem);
  const editingInput: RoleFormInput | undefined = editingRole ? {
    nameAr: editingRole.nameAr,
    descriptionAr: editingRole.descriptionAr,
    permissions: matrix[editingRole.key] ?? {},
  } : undefined;

  return {
    roles, matrix, matrixRoles,
    toggleMatrixPermission,
    showModal, editingInput,
    openCreate, openEdit, closeModal, submitRole,
    showManagerModal, creatingManager,
    openManagerModal:  () => setShowManagerModal(true),
    closeManagerModal: () => setShowManagerModal(false),
    submitManager,
  };
}
