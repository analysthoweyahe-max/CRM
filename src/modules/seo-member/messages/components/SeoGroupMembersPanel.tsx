import { useMemo, useState } from 'react';
import { LogOut, ShieldCheck, UserMinus, UserPlus, Users, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { MultiCombobox } from '@/shared/components/form/MultiCombobox';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  useAddSeoGroupMembers,
  useAssignSeoGroupManagers,
  useLeaveSeoGroup,
  useRemoveSeoGroupMembers,
  useSeoMentionables,
} from '../hooks/useSeoMessages';
import type {
  SeoConversation,
  SeoGroupMemberRef,
  SeoParticipant,
  SeoParticipantType,
} from '../types/messages.types';

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

interface Props {
  conversation: SeoConversation;
  currentUserId: string;
  isAr: boolean;
  onClose: () => void;
  onLeft: () => void;
  onUpdated: (conversation: SeoConversation) => void;
}

export function SeoGroupMembersPanel({
  conversation,
  currentUserId,
  isAr,
  onClose,
  onLeft,
  onUpdated,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  const participants = conversation.participants ?? [];
  const memberIds = useMemo(
    () => new Set(participants.map(p => memberKey(p.type, p.id))),
    [participants],
  );

  const canManageMembers = conversation.canManageMembers === true;

  const debouncedSearch = useDebounce(memberSearch, 300);
  const { data: mentionables = [], isLoading, isFetching } = useSeoMentionables(adding, debouncedSearch);
  const { mutateAsync: addMembers, isPending: addingPending } = useAddSeoGroupMembers(conversation.id, isAr);
  const { mutateAsync: removeMembers, isPending: removingPending } = useRemoveSeoGroupMembers(conversation.id, isAr);
  const { mutateAsync: assignManagers, isPending: assigningPending } = useAssignSeoGroupManagers(conversation.id, isAr);
  const { mutateAsync: leaveGroup, isPending: leavingPending } = useLeaveSeoGroup(isAr);

  const addableItems: ComboboxItem[] = useMemo(
    () =>
      mentionables
        .filter(m => !memberIds.has(memberKey(m.type, m.id)))
        .map(m => ({
          id:    memberKey(m.type, m.id),
          label: m.name,
          detail: m.type === 'admin'
            ? (isAr ? 'مدير' : 'Manager')
            : (m.department || (isAr ? 'موظف' : 'Employee')),
        })),
    [mentionables, memberIds, isAr],
  );

  async function handleAdd() {
    const members = selectedKeys
      .map(parseMemberKey)
      .filter((m): m is SeoGroupMemberRef => m != null);
    if (members.length === 0) return;
    try {
      const updated = await addMembers({ members });
      onUpdated(updated);
      setSelectedKeys([]);
      setMemberSearch('');
      setAdding(false);
    } catch {
      /* toast in hook */
    }
  }

  async function handleRemove(member: SeoParticipant) {
    if (member.id === currentUserId) return;
    try {
      const updated = await removeMembers({
        members: [{ type: member.type, id: member.id }],
      });
      onUpdated(updated);
    } catch {
      /* toast in hook */
    }
  }

  async function handleAssignManager(member: SeoParticipant) {
    try {
      const updated = await assignManagers({
        members: [{ type: member.type, id: member.id }],
      });
      onUpdated(updated);
    } catch {
      /* toast in hook */
    }
  }

  async function handleLeave() {
    try {
      await leaveGroup(conversation.id);
      onLeft();
    } catch {
      /* toast in hook */
    }
  }

  const busy = addingPending || removingPending || assigningPending || leavingPending;

  return (
    <div className="absolute inset-y-0 inset-s-0 sm:inset-s-auto inset-e-0 z-20 flex flex-col
                    w-full sm:w-72
                    bg-white dark:bg-gray-900
                    sm:border-s border-gray-100 dark:border-gray-700/60 shadow-xl">
      <div className="flex items-center justify-between gap-2 px-4 py-3.5
                      border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-2 min-w-0">
          <Users size={16} className="text-[#709028] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
              {isAr ? 'الأعضاء' : 'Members'}
            </p>
            <p className="text-[11px] text-gray-400">
              {conversation.participantCount ?? participants.length}{' '}
              {isAr ? 'عضو' : 'members'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {participants.length === 0 ? (
          <p className="px-4 py-8 text-xs text-center text-gray-400">
            {isAr ? 'لا يوجد أعضاء' : 'No members'}
          </p>
        ) : (
          participants.map(member => {
            const isSelf = member.id === currentUserId;
            return (
              <div
                key={memberKey(member.type, member.id)}
                className="flex items-center gap-3 px-4 py-2.5
                           border-b border-gray-50 dark:border-gray-700/30"
              >
                <div className="w-8 h-8 rounded-full bg-[#A0CD39] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-900">
                    {(member.avatarInitial ?? member.name.charAt(0)).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate flex items-center gap-1.5">
                    <span className="truncate">
                      {member.name}
                      {isSelf ? ` (${isAr ? 'أنت' : 'you'})` : ''}
                    </span>
                    {member.isManager && (
                      <Badge variant="brand" label={isAr ? 'مدير الجروب' : 'Manager'} />
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {member.roleLabel
                      || (member.type === 'admin'
                        ? (isAr ? 'مدير' : 'Admin')
                        : (isAr ? 'موظف' : 'Employee'))}
                  </p>
                </div>
                {canManageMembers && !member.isManager && !isSelf && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAssignManager(member)}
                    title={isAr ? 'تعيين كمدير' : 'Make manager'}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#709028]
                               hover:bg-[#D8EBAE]/40 dark:hover:bg-[#A0CD39]/10
                               disabled:opacity-40 transition-colors"
                  >
                    <ShieldCheck size={14} />
                  </button>
                )}
                {canManageMembers && !member.isManager && !isSelf && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRemove(member)}
                    title={isAr ? 'إزالة' : 'Remove'}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600
                               hover:bg-red-50 dark:hover:bg-red-900/20
                               disabled:opacity-40 transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
        {canManageMembers && (adding ? (
          <div className="space-y-2">
            <MultiCombobox
              items={addableItems}
              values={selectedKeys}
              onChange={setSelectedKeys}
              onSearchChange={setMemberSearch}
              loading={isLoading || isFetching}
              disabled={busy}
              placeholder={isAr ? 'ابحث واختر أعضاء...' : 'Search and select members...'}
              searchPlaceholder={isAr ? 'بحث بالاسم...' : 'Search by name...'}
              noResultsText={isAr ? 'لا توجد نتائج' : 'No results'}
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                disabled={busy}
                onClick={() => {
                  setAdding(false);
                  setSelectedKeys([]);
                }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                disabled={selectedKeys.length === 0 || busy}
                isLoading={addingPending}
                onClick={handleAdd}
              >
                {isAr ? 'إضافة' : 'Add'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            startIcon={<UserPlus size={14} />}
            disabled={busy}
            onClick={() => setAdding(true)}
          >
            {isAr ? 'إضافة أعضاء' : 'Add members'}
          </Button>
        ))}

        <Button
          variant="danger"
          size="sm"
          fullWidth
          startIcon={<LogOut size={14} />}
          disabled={busy}
          isLoading={leavingPending}
          onClick={handleLeave}
        >
          {isAr ? 'مغادرة الجروب' : 'Leave group'}
        </Button>
      </div>
    </div>
  );
}
