import { useState } from 'react';
import { toast } from 'sonner';
import type { OrgSettings } from '../types/orgSettings.types';

const DEFAULT_SETTINGS: OrgSettings = {
  workDays:          ['sun', 'mon', 'tue', 'wed', 'thu'],
  workStart:         '09:00',
  workEnd:           '17:00',
  timezone:          'riyadh',
  companyName:       'هوية لتطوير البرمجيات',
  companyEmail:      'info@howeyah.com',
  companyPhone:      '+966 11 234 5678',
  companyWebsite:    'www.howeyah.com',
  companyAddress:    'الرياض، حي العليا، المملكة العربية السعودية',
  logoInitial:       'H',
  passwordPolicy:    'strong',
  sessionTimeout:    '30',
  twoFactorEnabled:  false,
  inviteMethod:      'email',
  defaultDepartment: 'التطوير',
  defaultRole:       'employee',
};

export function useOrgSettings(isAr: boolean) {
  const [saved,   setSaved]   = useState(DEFAULT_SETTINGS);
  const [draft,   setDraft]   = useState(DEFAULT_SETTINGS);
  const [saving,  setSaving]  = useState(false);

  function set<K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) {
    setDraft(prev => ({ ...prev, [key]: value }));
  }

  function toggleWorkDay(day: string) {
    setDraft(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day],
    }));
  }

  async function save() {
    setSaving(true);
    // No real endpoint yet — persists locally for this session.
    await new Promise(res => setTimeout(res, 400));
    setSaved(draft);
    setSaving(false);
    toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved');
  }

  function cancel() {
    setDraft(saved);
  }

  return { settings: draft, set, toggleWorkDay, save, cancel, saving };
}
