import { useState } from 'react';
import { useProjectClientUpdates } from '../hooks/useProjectClientUpdates';
import { ClientUpdatePhaseCard } from './ClientUpdatePhaseCard';

interface Props {
  projectId: string;
  isAr: boolean;
}

export function ProjectClientUpdatesTab({ projectId, isAr }: Props) {
  const { phases, isLoading } = useProjectClientUpdates(projectId);
  const [openId, setOpenId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#A0CD39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
        {isAr ? 'لا توجد مراحل لهذا المشروع' : 'No phases for this project'}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      <div className='p-3 flex flex-col items-center justify-center bg-blue-100 rounded-2xl  text-blue-500 w-fit mx-auto'>
        <span>note:</span>
        بانتظار الربط مع crm  العميل
      </div>
      {phases.map(phase => (
        <ClientUpdatePhaseCard
          key={phase.uuid}
          projectId={projectId}
          phase={phase}
          isOpen={openId === phase.id}
          onToggle={() => setOpenId(id => id === phase.id ? null : phase.id)}
          isAr={isAr}
        />
      ))}
    </div>
  );
}
