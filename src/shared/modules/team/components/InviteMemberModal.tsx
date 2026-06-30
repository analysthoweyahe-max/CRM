import { Modal }               from '@/shared/components/ui/Modal';
import { Button }              from '@/shared/components/ui/Button';
import { Combobox }            from '@/shared/components/form/Combobox';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import type { ComboboxItem }   from '@/shared/components/form/Combobox';

interface Props {
  open:           boolean;
  onClose:        () => void;
  title?:         string;
  availableItems: ComboboxItem[];
  selectedId:     string;
  email:          string;
  role:           string;
  onSelectMember: (id: string) => void;
  onSetEmail:     (v: string) => void;
  onSetRole:      (v: string) => void;
  onConfirm:      () => void;
  canAdd:         boolean;
  isAr:           boolean;
}

export function InviteMemberModal({
  open, onClose, title,
  availableItems, selectedId, email, role,
  onSelectMember, onSetEmail, onSetRole,
  onConfirm, canAdd, isAr,
}: Props) {
  const modalTitle = title ?? (isAr ? 'إضافة عضو للمشروع' : 'Add Member to Project');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!canAdd} onClick={onConfirm}>
            {isAr ? 'إرسال دعوة' : 'Send Invite'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">

        <FormField label={isAr ? 'اختر عضواً' : 'Select Member'} required>
          <Combobox
            items={availableItems}
            value={selectedId}
            onChange={onSelectMember}
            placeholder={isAr ? 'اختر عضواً' : 'Select a member'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'}>
          <input
            type="email"
            value={email}
            onChange={e => onSetEmail(e.target.value)}
            placeholder="example@howeyah.com"
            className={inputCls(false)}
          />
        </FormField>

        <FormField label={isAr ? 'الدور في المشروع' : 'Role in Project'}>
          <input
            type="text"
            value={role}
            onChange={e => onSetRole(e.target.value)}
            placeholder={isAr ? 'المطور' : 'Developer'}
            className={inputCls(false)}
          />
        </FormField>

      </div>
    </Modal>
  );
}
