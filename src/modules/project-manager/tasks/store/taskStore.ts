import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '../types/task.types';
import { INITIAL_TASKS } from '../data/taskData';

type Listener = () => void;

let tasks: Task[] = [...INITIAL_TASKS];
const listeners = new Set<Listener>();

function notify() { listeners.forEach(fn => fn()); }

export function getAllTasks(): Task[] {
  return tasks;
}

export function getProjectTasks(projectId: string): Task[] {
  return tasks.filter(t => t.projectId === projectId);
}

export function moveTask(taskId: string, newStatus: TaskStatus): void {
  tasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
  notify();
}

export function addTask(task: Task): void {
  tasks = [...tasks, task];
  notify();
}

export function deleteTask(id: string): void {
  tasks = tasks.filter(t => t.id !== id);
  notify();
}

export function useProjectTasks(projectId: string): Task[] {
  const [state, setState] = useState<Task[]>(() => getProjectTasks(projectId));

  useEffect(() => {
    setState(getProjectTasks(projectId));
    const unsub = () => setState([...getProjectTasks(projectId)]);
    listeners.add(unsub);
    return () => { listeners.delete(unsub); };
  }, [projectId]);

  return state;
}
