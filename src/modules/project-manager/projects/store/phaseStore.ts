import { useState, useEffect } from 'react';

export interface Phase {
  id:        string;
  projectId: string;
  label:     string;
  order:     number;
}

const DEFAULT_LABELS = ['متطلبات العمل', 'التحليل', 'التصميم', 'التطوير', 'الاختبار', 'النشر'];

let phases: Phase[] = [];
const listeners = new Set<() => void>();

function notify() { listeners.forEach(fn => fn()); }

function ensureDefaults(projectId: string) {
  const existing = phases.filter(p => p.projectId === projectId);
  if (existing.length === 0) {
    const defaults = DEFAULT_LABELS.map((label, i) => ({
      id:        `phase-${projectId}-${i}`,
      projectId,
      label,
      order:     i,
    }));
    phases = [...phases, ...defaults];
  }
}

export function getProjectPhases(projectId: string): Phase[] {
  ensureDefaults(projectId);
  return phases
    .filter(p => p.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export function addPhase(projectId: string, label: string): void {
  ensureDefaults(projectId);
  const max = Math.max(-1, ...phases.filter(p => p.projectId === projectId).map(p => p.order));
  phases = [...phases, { id: `phase-${projectId}-${Date.now()}`, projectId, label, order: max + 1 }];
  notify();
}

export function deletePhase(phaseId: string): void {
  phases = phases.filter(p => p.id !== phaseId);
  notify();
}

export function movePhaseUp(phaseId: string): void {
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return;
  const above = phases
    .filter(p => p.projectId === phase.projectId && p.order < phase.order)
    .sort((a, b) => b.order - a.order)[0];
  if (!above) return;
  phases = phases.map(p => {
    if (p.id === phaseId)  return { ...p, order: above.order };
    if (p.id === above.id) return { ...p, order: phase.order };
    return p;
  });
  notify();
}

export function movePhaseDown(phaseId: string): void {
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return;
  const below = phases
    .filter(p => p.projectId === phase.projectId && p.order > phase.order)
    .sort((a, b) => a.order - b.order)[0];
  if (!below) return;
  phases = phases.map(p => {
    if (p.id === phaseId)  return { ...p, order: below.order };
    if (p.id === below.id) return { ...p, order: phase.order };
    return p;
  });
  notify();
}

export function useProjectPhases(projectId: string): Phase[] {
  const [state, setState] = useState<Phase[]>(() => getProjectPhases(projectId));
  useEffect(() => {
    const unsub = () => setState([...getProjectPhases(projectId)]);
    listeners.add(unsub);
    return () => { listeners.delete(unsub); };
  }, [projectId]);
  return state;
}
