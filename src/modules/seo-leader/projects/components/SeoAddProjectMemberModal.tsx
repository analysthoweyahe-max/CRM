import { Modal }               from '@/shared/components/ui/Modal';
import { Button }              from '@/shared/components/ui/Button';
import { Combobox }            from '@/shared/components/form/Combobox';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import type { ComboboxItem }   from '@/shared/components/form/Combobox';

interface Props {
  open:        boolean;
  onClose:     () => void;
  isAr:        boolean;
  available:   ComboboxItem[];
  selectedId:  string;
  projectRole: string;
  onSelect:    (id: string) => void;
  onSetRole:   (v: string) => void;
  canAdd:      boolean;
  onConfirm:   () => void;
}

export function SeoAddProjectMemberModal({
  open, onClose, isAr,
  available, selectedId, projectRole,
  onSelect, onSetRole,
  canAdd, onConfirm,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة عضو للمشروع' : 'Add Member to Project'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!canAdd} onClick={onConfirm}>
            {isAr ? 'إضافة' : 'Add'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">

        <FormField label={isAr ? 'اختر عضواً من الفريق' : 'Select a team member'} required>
          <Combobox
            items={available}
            value={selectedId}
            onChange={onSelect}
            placeholder={isAr ? 'اختر عضواً' : 'Select member'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'الدور في المشروع' : 'Role in Project'} required>
          <input
            type="text"
            value={projectRole}
            onChange={e => onSetRole(e.target.value)}
            placeholder={isAr ? 'مثال: أخصائي SEO' : 'e.g. SEO Specialist'}
            className={inputCls(false)}
          />
        </FormField>

      </div>
    </Modal>
  );
}
