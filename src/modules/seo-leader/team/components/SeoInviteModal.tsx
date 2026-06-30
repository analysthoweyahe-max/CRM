import { useState, useEffect }       from 'react';
import { Modal }                     from '@/shared/components/ui/Modal';
import { Button }                    from '@/shared/components/ui/Button';
import { Combobox }                  from '@/shared/components/form/Combobox';
import { FormField, inputCls }       from '@/shared/components/form/FormField';
import { seoTeamApi }                from '../api/seoTeam.api';
import type { SeoTeamInvitePayload, SeoJobTitle } from '../types/seoTeam.types';
import type { ComboboxItem }         from '@/shared/components/form/Combobox';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onConfirm: (payload: SeoTeamInvitePayload) => Promise<void>;
  isAr:      boolean;
}

export function SeoInviteModal({ open, onClose, onConfirm, isAr }: Props) {
  const [email,      setEmail]      = useState('');
  const [name,       setName]       = useState('');
  const [jobTitleId, setJobTitleId] = useState('');
  const [jobTitles,  setJobTitles]  = useState<SeoJobTitle[]>([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    if (!open) return;
    seoTeamApi.getJobTitles()
      .then(res => setJobTitles(res.data.data ?? []))
      .catch(() => setJobTitles([]));
  }, [open]);

  const jobTitleItems: ComboboxItem[] = jobTitles.map(jt => ({
    id:    String(jt.id),
    label: jt.name,
  }));

  async function handleConfirm() {
    if (!email.trim() || !jobTitleId) return;
    setIsLoading(true);
    setError('');
    try {
      await onConfirm({
        email:        email.trim(),
        name:         name.trim() || undefined,
        job_title_id: Number(jobTitleId),
      });
      handleClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : (isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred')
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setEmail('');
    setName('');
    setJobTitleId('');
    setError('');
    onClose();
  }

  const canSubmit = email.trim() !== '' && jobTitleId !== '' && !isLoading;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'دعوة عضو جديد' : 'Invite New Member'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!canSubmit} onClick={handleConfirm}>
            {isLoading
              ? (isAr ? 'جارٍ الإرسال...' : 'Sending…')
              : (isAr ? 'إرسال الدعوة' : 'Send Invite')}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">

        {/* Server error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 text-end">
            {error}
          </div>
        )}

        <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="example@howeyah.com"
            className={inputCls(false)}
            dir="ltr"
          />
        </FormField>

        <FormField label={isAr ? 'الاسم' : 'Name'}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isAr ? 'اسم العضو' : 'Member name'}
            className={inputCls(false)}
          />
        </FormField>

        <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'} required>
          <Combobox
            items={jobTitleItems}
            value={jobTitleId}
            onChange={id => { setJobTitleId(id); setError(''); }}
            placeholder={isAr ? 'اختر المسمى الوظيفي' : 'Select job title'}
            searchPlaceholder={isAr ? 'ابحث...' : 'Search…'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

      </div>
    </Modal>
  );
}
