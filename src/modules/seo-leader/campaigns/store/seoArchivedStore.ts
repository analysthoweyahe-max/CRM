import { useState, useEffect } from 'react';

const archivedIds = new Set<number>();
const listeners   = new Set<() => void>();

function notify() { listeners.forEach(l => l()); }

export function archiveSeoProject(id: number) {
  archivedIds.add(id);
  notify();
}

export function isArchivedSeoProject(id: number) {
  return archivedIds.has(id);
}

export function useArchivedSeoProjects(): ReadonlySet<number> {
  const [, rerender] = useState(0);
  useEffect(() => {
    const cb = () => rerender(n => n + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);
  return archivedIds;
}
