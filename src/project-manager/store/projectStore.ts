import { useState, useEffect } from 'react';
import { PROJECTS as INITIAL } from '../data/projectData';
import type { Project } from '../types/project.types';

let projects: Project[] = [...INITIAL];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

export function getProjects(): Project[] {
  return projects;
}

export function addProject(p: Project): void {
  projects = [p, ...projects];
  notify();
}

export function useProjects(): Project[] {
  const [state, setState] = useState<Project[]>(projects);
  useEffect(() => {
    const unsub = () => setState([...projects]);
    listeners.add(unsub);
    return () => { listeners.delete(unsub); };
  }, []);
  return state;
}
