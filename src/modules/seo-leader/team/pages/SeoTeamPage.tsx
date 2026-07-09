import { Download, UserPlus } from 'lucide-react';
import { useLang }               from '@/app/providers/LanguageProvider';
import { Button }                from '@/shared/components/ui/Button';
import { SearchInput }           from '@/shared/components/ui/SearchInput';
import { MemberCard }            from '@/shared/modules/team/components/MemberCard';
import { TeamPageSkeleton }      from '@/shared/modules/team/components/TeamPageSkeleton';
import { useSeoTeamPage }        from '../hooks/useSeoTeamPage';
import { SeoMemberProfileModal } from '../components/SeoMemberProfileModal';
import { SeoInviteModal }        from '../components/SeoInviteModal';

export function SeoTeamPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    members, total, page, setPage, pageCount,
    selected, selectedCount, isAllSelected,
    search, handleSearch,
    toggleAll, toggleOne, clearSelection, toggleActive, exportSelected,
    showInvite, openInvite, closeInvite, handleInvite,
    profileMember, openProfile, closeProfile,
    isLoading, getColor,
  } = useSeoTeamPage(isAr);

  if (isLoading && members.length === 0) return <TeamPageSkeleton />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="text-end space-y-0.5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'فريق العمل' : 'Work Team'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr ? 'أعضاء فريق SEO التابعين لك' : 'Your SEO team members across your projects'}
        </p>
      </div>

      {/* Add member button */}
      <div className="flex justify-end">
        <Button variant="primary" startIcon={<UserPlus size={15} />} onClick={openInvite}>
          {isAr ? 'دعوة عضو جديد' : 'Invite New Member'}
        </Button>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={handleSearch}
        placeholder={isAr ? 'ابحث عن عضو...' : 'Search members...'}
      />

      {/* Selection action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl
                        bg-[#D8EBAE] dark:bg-[#A0CD39]/10 border border-[#A0CD39]/50">
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {isAr ? 'إلغاء التحديد' : 'Deselect'}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#709028] dark:text-[#A0CD39]">
              {isAr ? `تم تحديد ${selectedCount}` : `${selectedCount} selected`}
            </span>
            <Button variant="ghost" size="sm" startIcon={<Download size={14} />} onClick={exportSelected}>
              {isAr ? 'تصدير' : 'Export'}
            </Button>
          </div>
        </div>
      )}

      {/* Select-all */}
      <label className="flex items-center gap-2 justify-end cursor-pointer w-fit ms-auto">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isAr ? 'تحديد كل أعضاء الصفحة' : 'Select all on this page'}
        </span>
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={toggleAll}
          className="w-4 h-4 rounded accent-[#A0CD39]"
        />
      </label>

      {/* Loading overlay for subsequent fetches */}
      {isLoading && members.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#A0CD39] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && members.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          {search
            ? (isAr ? 'لا توجد نتائج للبحث' : 'No results found')
            : (isAr ? 'لا يوجد أعضاء في الفريق بعد' : 'No team members yet')}
        </div>
      )}

      {/* Grid */}
      {members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={{
                id:           member.id,
                initial:      member.avatarInitial,
                color:        getColor(member),
                name:         member.name,
                role:         member.jobTitle?.name,
                email:        member.email,
                isActive:     member.isActive,
                projectCount: member.activeProjectsCount,
              }}
              selected={selected.has(member.id)}
              onToggle={toggleOne}
              onView={openProfile}
              onToggleActive={toggleActive}
              isAr={isAr}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <p>
            {isAr
              ? `يتم عرض ${members.length} من أصل ${total}`
              : `Showing ${members.length} of ${total}`}
          </p>
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</PageBtn>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
              <PageBtn key={n} onClick={() => setPage(n)} active={n === page}>{n}</PageBtn>
            ))}
            <PageBtn onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>›</PageBtn>
          </div>
        </div>
      )}

      <SeoInviteModal
        open={showInvite}
        onClose={closeInvite}
        onConfirm={handleInvite}
        isAr={isAr}
      />

      <SeoMemberProfileModal member={profileMember} onClose={closeProfile} isAr={isAr} />
    </div>
  );
}

function PageBtn({
  children, onClick, disabled, active,
}: {
  children:  React.ReactNode;
  onClick:   () => void;
  disabled?: boolean;
  active?:   boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-8 h-8 rounded-lg border text-sm font-medium flex items-center justify-center transition-colors',
        active
          ? 'border-[#A0CD39] bg-[#D8EBAE] text-[#709028] dark:bg-[#A0CD39]/20 dark:text-[#A0CD39]'
          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
