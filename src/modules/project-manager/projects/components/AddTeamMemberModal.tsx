import { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal }               from '@/shared/components/ui/Modal';
import { Button }              from '@/shared/components/ui/Button';
import { SearchInput }         from '@/shared/components/form/SearchInput';
import { FormField, inputCls } from '@/shared/components/form/FormField';
import { matchesSearch }       from '@/shared/utils/search.utils';
import type { ComboboxItem }   from '@/shared/components/form/Combobox';

interface Props {
  open:        boolean;
  onClose:     () => void;
  isAr:        boolean;
  available:   ComboboxItem[];
  selectedIds: string[];
  projectRole: string;
  onToggle:    (id: string) => void;
  onSetRole:   (v: string) => void;
  canAdd:      boolean;
  onConfirm:   () => void;
}

export function AddTeamMemberModal({
  open, onClose, isAr,
  available, selectedIds, projectRole,
  onToggle, onSetRole,
  canAdd, onConfirm,
}: Props) {
  const [search, setSearch] = useState('');
  const filtered = available.filter(m => matchesSearch([m.label, m.detail], search));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAr ? 'إضافة أعضاء للمشروع' : 'Add Members to Project'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" disabled={!canAdd} onClick={onConfirm}>
            {isAr
              ? `إضافة${selectedIds.length ? ` (${selectedIds.length})` : ''}`
              : `Add${selectedIds.length ? ` (${selectedIds.length})` : ''}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">

        <FormField label={isAr ? 'اختر أعضاء من الفريق' : 'Select team members'} required>
          <SearchInput value={search} onChange={setSearch} isAr={isAr} />
          <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.length === 0 && (
              <p className="p-3 text-sm text-gray-400 text-center">
                {isAr ? 'لا توجد نتائج' : 'No results'}
              </p>
            )}
            {filtered.map(m => {
              const checked = selectedIds.includes(String(m.id));
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onToggle(String(m.id))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-start hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className={`shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors
                    ${checked ? 'bg-[#A0CD39] border-[#A0CD39]' : 'border-gray-300 dark:border-gray-500'}`}>
                    {checked && <Check size={11} className="text-white" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-gray-800 dark:text-gray-100 truncate">{m.label}</span>
                    {m.detail && <span className="block text-xs text-gray-400 truncate">{m.detail}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label={isAr ? 'الدور في المشروع' : 'Role in Project'} required>
          <input
            type="text"
            value={projectRole}
            onChange={e => onSetRole(e.target.value)}
            placeholder={isAr ? 'مثال: مطور واجهات أمامية' : 'e.g. Frontend Developer'}
            className={inputCls(false)}
          />
        </FormField>

      </div>
    </Modal>
  );
}
