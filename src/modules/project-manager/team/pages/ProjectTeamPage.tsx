import { Download, MessageCircle } from 'lucide-react';
import { useLang }            from '@/app/providers/LanguageProvider';
import { Button }             from '@/shared/components/ui/Button';
import { GlobalMemberCard }   from '../components/GlobalMemberCard';
import { MemberProfileModal } from '../../projects/components/MemberProfileModal';
import { useProjectTeamPage } from '../hooks/useProjectTeamPage';

export function ProjectTeamPage() {
  const { lang } = useLang();
  const isAr     = lang === 'ar';

  const {
    members, total, page, setPage, pageCount,
    selected, selectedCount, isAllSelected,
    toggleAll, toggleOne, clearSelection, toggleActive, exportSelected,
    profileMember, openProfile, closeProfile,
  } = useProjectTeamPage(isAr);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="text-end space-y-0.5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'فريق العمل' : 'Work Team'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAr ? 'جميع أعضاء الفريق عبر مشاريعك' : 'All team members across your projects'}
        </p>
      </div>

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
            <Button variant="ghost" size="sm" startIcon={<MessageCircle size={14} />}>
              {isAr ? 'رسالة جماعية' : 'Bulk Message'}
            </Button>
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map(member => (
          <GlobalMemberCard
            key={member.name}
            member={member}
            selected={selected.has(member.name)}
            onToggle={toggleOne}
            onView={openProfile}
            onToggleActive={toggleActive}
            isAr={isAr}
          />
        ))}
      </div>

      {/* Pagination */}
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

      <MemberProfileModal member={profileMember} onClose={closeProfile} isAr={isAr} />
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
