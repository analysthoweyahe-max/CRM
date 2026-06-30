import { useState }             from 'react';
import { Modal }               from '@/shared/components/ui/Modal';
import { Button }              from '@/shared/components/ui/Button';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import type { SeoTeamInvitePayload } from '../types/seoTeam.types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onConfirm: (payload: SeoTeamInvitePayload) => Promise<void>;
  isAr:      boolean;
}

export function SeoInviteModal({ open, onClose, onConfirm, isAr }: Props) {
  const [email,     setEmail]     = useState('');
  const [name,      setName]      = useState('');
  const [role,      setRole]      = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await onConfirm({
        email: email.trim(),
        name:  name.trim()  || undefined,
        role:  role.trim()  || undefined,
      });
      handleClose();
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setEmail('');
    setName('');
    setRole('');
    onClose();
  }

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
          <Button
            variant="primary"
            disabled={!email.trim() || isLoading}
            onClick={handleConfirm}
          >
            {isLoading
              ? (isAr ? 'جارٍ الإرسال...' : 'Sending…')
              : (isAr ? 'إرسال الدعوة' : 'Send Invite')}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">

        <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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

        <FormField label={isAr ? 'المسمى الوظيفي' : 'Job Title'}>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder={isAr ? 'كاتب محتوى' : 'Content Writer'}
            className={inputCls(false)}
          />
        </FormField>

      </div>
    </Modal>
  );
}
