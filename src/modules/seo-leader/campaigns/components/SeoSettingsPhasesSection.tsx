import { useState }       from 'react';
import { PhasesManagerUI } from '@/shared/modules/project/components/PhasesManagerUI';
import type { PhaseItem }  from '@/shared/modules/project/components/PhasesManagerUI';

const DEFAULT_PHASES: PhaseItem[] = [
  { id: '1', label: 'بحث الكلمات المفتاحية', duration: '1 مواد' },
  { id: '2', label: 'تحليل المنافسين',        duration: '1 مواد' },
  { id: '3', label: 'تقني SEO',               duration: '2 مواد' },
  { id: '4', label: 'تحسين الصفحات',          duration: '3 مواد' },
  { id: '5', label: 'الربط الداخلي',          duration: '1 مواد' },
  { id: '6', label: 'بناء الروابط',            duration: '1 مواد' },
];

let _nextId = 100;

interface Props { isAr: boolean }

export function SeoSettingsPhasesSection({ isAr }: Props) {
  const [phases, setPhases] = useState<PhaseItem[]>(DEFAULT_PHASES);

  function handleAdd(label: string) {
    setPhases(prev => [...prev, { id: String(++_nextId), label }]);
  }

  function handleDelete(id: string) {
    setPhases(prev => prev.filter(p => p.id !== id));
  }

  function handleMoveUp(id: string) {
    setPhases(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function handleMoveDown(id: string) {
    setPhases(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx < 0 || idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  return (
    <PhasesManagerUI
      phases={phases}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      isAr={isAr}
    />
  );
}
