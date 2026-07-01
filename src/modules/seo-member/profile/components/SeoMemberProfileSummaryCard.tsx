import { Target, CheckSquare, Clock } from 'lucide-react';
import { useAuth }       from '@/modules/auth/context/AuthContext';
import { Card }          from '@/shared/components/ui/Card';
import { useSeoTasks }   from '../../tasks/hooks/useSeoTasks';

interface Props { isAr: boolean }

export function SeoMemberProfileSummaryCard({ isAr }: Props) {
  const { user }    = useAuth();
  const { data }    = useSeoTasks();
  const taskCount   = data?.total ?? 0;
  const initial     = (user?.fullName ?? 'S').slice(0, 1).toUpperCase();

  const STATS = [
    { icon: <Target      size={16} />, label: isAr ? 'الحملات'         : 'Campaigns',   value: 1          },
    { icon: <CheckSquare size={16} />, label: isAr ? 'المهام'           : 'Tasks',       value: taskCount  },
    { icon: <Clock       size={16} />, label: isAr ? 'إجمالي الساعات'  : 'Total Hours', value: 0          },
  ];

  return (
    <Card padding="lg" className="flex flex-col items-center text-center gap-5">

      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center mt-2 shrink-0">
        <span className="text-3xl font-bold text-white">{initial}</span>
      </div>

      {/* Name + role */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-snug">
          {user?.fullName}
        </h2>
        <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
          {isAr ? 'موظف SEO' : 'SEO Specialist'}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#D8EBAE] dark:bg-[#A0CD39]/20" />

      {/* Stats */}
      <div className="w-full space-y-3 px-1">
        {STATS.map((stat, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {stat.value}
            </span>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="text-sm">{stat.label}</span>
              <span className="text-[#709028] dark:text-[#A0CD39]">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

    </Card>
  );
}
