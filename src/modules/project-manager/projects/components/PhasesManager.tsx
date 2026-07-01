import { PhasesManagerUI }  from '@/shared/modules/project/components/PhasesManagerUI';
import { useProjectPhases, addPhase, deletePhase, movePhaseUp, movePhaseDown } from '../store/phaseStore';

interface Props {
  projectId: string;
  isAr:      boolean;
}

export function PhasesManager({ projectId, isAr }: Props) {
  const phases = useProjectPhases(projectId);

  return (
    <PhasesManagerUI
      phases={phases.map(p => ({ id: p.id, label: p.label }))}
      onAdd={label  => addPhase(projectId, label)}
      onDelete={id  => deletePhase(id)}
      onMoveUp={id  => movePhaseUp(id)}
      onMoveDown={id => movePhaseDown(id)}
      isAr={isAr}
    />
  );
}
