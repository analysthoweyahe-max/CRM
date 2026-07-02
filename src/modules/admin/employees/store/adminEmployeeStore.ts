import { useState, useEffect } from 'react';
import { MOCK_EMPLOYEES } from '../data/employeeData';
import type { AdminEmployeeDetail } from '../types/adminEmployee.types';

let employees: AdminEmployeeDetail[] = [...MOCK_EMPLOYEES];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

export function getEmployees(): AdminEmployeeDetail[] {
  return employees;
}

export function getEmployee(id: string): AdminEmployeeDetail | undefined {
  return employees.find(e => e.id === id);
}

export function addEmployee(newEmp: AdminEmployeeDetail): void {
  employees = [newEmp, ...employees];
  notify();
}

export function updateEmployee(id: string, updates: Partial<AdminEmployeeDetail>): void {
  employees = employees.map(e => e.id === id ? { ...e, ...updates } : e);
  notify();
}

export function useEmployees(): AdminEmployeeDetail[] {
  const [state, setState] = useState<AdminEmployeeDetail[]>(employees);
  useEffect(() => {
    const unsub = () => setState([...employees]);
    listeners.add(unsub);
    return () => { listeners.delete(unsub); };
  }, []);
  return state;
}
