import type { TeamMember } from '../../projects/types/project.types';

export function TeamAvatars({ team }: { team: TeamMember[] }) {
  const shown = team.slice(0, 4);
  const extra = team.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div
          key={i}
          title={m.name}
          className={`w-7 h-7 rounded-full border-2 border-white dark:border-gray-800
                      flex items-center justify-center text-xs font-bold text-white
                      shrink-0 ${m.color} ${i > 0 ? '-ms-2' : ''}`}
        >
          {m.initial}
        </div>
      ))}
      {extra > 0 && (
        <div className="-ms-2 w-7 h-7 rounded-full border-2 border-white dark:border-gray-800
                        bg-gray-200 dark:bg-gray-600 flex items-center justify-center
                        text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
          +{extra}
        </div>
      )}
    </div>
  );
}
