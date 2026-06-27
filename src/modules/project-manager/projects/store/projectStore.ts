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

export function updateProject(id: string, updates: Partial<Omit<Project, 'id'>>): void {
  projects = projects.map(p => p.id === id ? { ...p, ...updates } : p);
  notify();
}

export function deleteProject(id: string): void {
  projects = projects.filter(p => p.id !== id);
  notify();
}

export function archiveProject(id: string): void {
  projects = projects.map(p => p.id === id ? { ...p, isArchived: true } : p);
  notify();
}

export function unarchiveProject(id: string): void {
  projects = projects.map(p => p.id === id ? { ...p, isArchived: false } : p);
  notify();
}

export function getProject(id: string): Project | undefined {
  return projects.find(p => p.id === id);
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
