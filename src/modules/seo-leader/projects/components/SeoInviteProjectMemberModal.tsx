import { Modal }               from '@/shared/components/ui/Modal';
import { Button }              from '@/shared/components/ui/Button';
import { Combobox }            from '@/shared/components/form/Combobox';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import type { ComboboxItem }   from '@/shared/components/form/Combobox';

interface Props {
  open:           boolean;
  onClose:        () => void;
  isAr:           boolean;
  name:           string;
  email:          string;
  departmentId:   string;
  jobTitleId:     string;
  projectRole:    string;
  departments:    ComboboxItem[];
  jobTitles:      ComboboxItem[];
  onSetName:      (v: string) => void;
  onSetEmail:     (v: string) => void;
  onSetDepartment: (id: string) => void;
  onSetJobTitle:  (id: string) => void;
  onSetRole:      (v: string) => void;
  canInvite:      boolean;
  isSubmitting:   boolean;
  onConfirm:      () => void;
}

export function SeoInviteProjectMemberModal({
  open, onClose, isAr,
  name, email, departmentId, jobTitleId, projectRole,
  departments, jobTitles,
  onSetName, onSetEmail, onSetDepartment, onSetJobTitle, onSetRole,
  canInvite, isSubmitting, onConfirm,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'دعوة عضو جديد للمشروع' : 'Invite New Member to Project'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!canInvite || isSubmitting} onClick={onConfirm}>
            {isSubmitting
              ? (isAr ? 'جارٍ الإرسال...' : 'Sending…')
              : (isAr ? 'إرسال الدعوة' : 'Send Invite')}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">

        <FormField label={isAr ? 'الاسم' : 'Name'} required>
          <input
            type="text"
            value={name}
            onChange={e => onSetName(e.target.value)}
            placeholder={isAr ? 'اسم العضو' : 'Member name'}
            className={inputCls(false)}
          />
        </FormField>

        <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required>
          <input
            type="email"
            value={email}
            onChange={e => onSetEmail(e.target.value)}
            placeholder="example@howeyah.com"
            className={inputCls(false)}
            dir="ltr"
          />
        </FormField>

        <FormField label={isAr ? 'القسم' : 'Department'} required>
          <Combobox
            items={departments}
            value={departmentId}
            onChange={onSetDepartment}
            placeholder={isAr ? 'اختر القسم' : 'Select department'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} required>
          <Combobox
            items={jobTitles}
            value={jobTitleId}
            onChange={onSetJobTitle}
            disabled={!departmentId}
            placeholder={isAr ? 'اختر المسمى الوظيفي' : 'Select job title'}
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
