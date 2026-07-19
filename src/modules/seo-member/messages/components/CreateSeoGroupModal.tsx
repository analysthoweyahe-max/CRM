import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useCreateSeoGroup, useSeoMentionables } from '../hooks/useSeoMessages';
import type { SeoConversation, SeoGroupMemberRef, SeoMentionable, SeoParticipantType } from '../types/messages.types';

function memberKey(type: string, id: string) {
  return `${type}:${id}`;
}

function parseMemberKey(key: string): SeoGroupMemberRef | null {
  const idx = key.indexOf(':');
  if (idx <= 0) return null;
  const type = key.slice(0, idx) as SeoParticipantType;
  const id = key.slice(idx + 1);
  if ((type !== 'employee' && type !== 'admin') || !id) return null;
  return { type, id };
}

function toItem(m: SeoMentionable, isAr: boolean): ComboboxItem {
  return {
    id:    memberKey(m.type, m.id),
    label: m.name,
    detail: m.type === 'admin'
      ? (m.role === 'super-admin' ? (isAr ? 'سوبر أدمن' : 'Super Admin')
        : m.role === 'seo-manager' ? (isAr ? 'مدير SEO' : 'SEO Manager')
        : m.role === 'hr-manager' ? (isAr ? 'مدير HR' : 'HR Manager')
        : m.role === 'project-manager' ? (isAr ? 'مدير مشاريع' : 'Project Manager')
        : (isAr ? 'مدير' : 'Manager'))
      : (m.department || (isAr ? 'موظف' : 'Employee')),
  };
}

interface Props {
  open:    boolean;
  isAr:    boolean;
  onClose: () => void;
  onCreated: (conversation: SeoConversation) => void;
}

export function CreateSeoGroupModal({ open, isAr, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [nameError, setNameError] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedCache, setSelectedCache] = useState<ComboboxItem[]>([]);

  const debouncedSearch = useDebounce(memberSearch, 300);
  const {
    data: mentionables = [],
    isLoading: loadingMentionables,
    isFetching,
    isError: mentionablesError,
  } = useSeoMentionables(open, debouncedSearch);

  const { mutateAsync: createGroup, isPending } = useCreateSeoGroup(isAr);

  const items: ComboboxItem[] = useMemo(() => {
    const fromApi = mentionables.map(m => toItem(m, isAr));
    const byId = new Map(fromApi.map(i => [i.id, i]));
    for (const cached of selectedCache) {
      if (selectedKeys.includes(cached.id) && !byId.has(cached.id)) {
        byId.set(cached.id, cached);
      }
    }
    return Array.from(byId.values());
  }, [mentionables, isAr, selectedCache, selectedKeys]);

  function handleMembersChange(keys: string[]) {
    setSelectedKeys(keys);
    setSelectedCache(prev => {
      const keep = prev.filter(i => keys.includes(i.id));
      const keepIds = new Set(keep.map(i => i.id));
      const additions = items.filter(i => keys.includes(i.id) && !keepIds.has(i.id));
      return [...keep, ...additions];
    });
  }

  function reset() {
    setName('');
    setMessage('');
    setSelectedKeys([]);
    setSelectedCache([]);
    setMemberSearch('');
    setNameError(false);
  }

  function handleClose() {
    if (isPending) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    const members = selectedKeys
      .map(parseMemberKey)
      .filter((m): m is SeoGroupMemberRef => m != null);

    if (members.length === 0) return;

    try {
      const conversation = await createGroup({
        name: trimmed,
        members,
        message: message.trim() || undefined,
      });
      reset();
      onCreated(conversation);
      onClose();
    } catch {
      /* toast handled in hook */
    }
  }

  const canSubmit = name.trim().length > 0 && selectedKeys.length > 0 && !isPending;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isAr ? 'إنشاء جروب' : 'Create group'}
      description={isAr ? 'اختر اسماً وأعضاءً لبدء محادثة جماعية' : 'Pick a name and members to start a group chat'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isPending}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit} isLoading={isPending}>
            {isAr ? 'إنشاء' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">
        <FormField label={isAr ? 'اسم الجروب' : 'Group name'} required>
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (nameError) setNameError(false);
            }}
            maxLength={120}
            placeholder={isAr ? 'مثال: فريق المحتوى' : 'e.g. Content team'}
            className={inputCls(nameError)}
          />
        </FormField>

        <FormField label={isAr ? 'الأعضاء' : 'Members'} required>
          <MultiCombobox
            items={items}
            values={selectedKeys}
            onChange={handleMembersChange}
            onSearchChange={setMemberSearch}
            loading={loadingMentionables || isFetching}
            disabled={mentionablesError}
            placeholder={
              mentionablesError
                ? (isAr ? 'تعذّر تحميل الأعضاء' : 'Failed to load members')
                : (isAr ? 'ابحث واختر أعضاء...' : 'Search and select members...')
            }
            searchPlaceholder={isAr ? 'بحث بالاسم...' : 'Search by name...'}
            noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
          />
        </FormField>

        <FormField label={isAr ? 'رسالة افتتاحية (اختياري)' : 'Opening message (optional)'}>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            maxLength={5000}
            placeholder={isAr ? 'مرحبا بالجميع...' : 'Hello everyone...'}
            className={`${inputCls(false)} resize-none`}
          />
        </FormField>
      </div>
    </Modal>
  );
}
