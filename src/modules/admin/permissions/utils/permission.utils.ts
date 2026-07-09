import type { ApiPermission } from '../types/adminPermission.types';



export function normalizePermission(raw: unknown): ApiPermission | null {

  if (!raw || typeof raw !== 'object') return null;



  const p = raw as Record<string, unknown>;

  if (p.id == null || p.name == null) return null;



  return {

    id:        Number(p.id),

    name:      String(p.name),

    guardName: (p.guardName ?? p.guard_name ?? 'admin') as 'admin' | 'web',

    createdAt: String(p.createdAt ?? p.created_at ?? ''),

    updatedAt: String(p.updatedAt ?? p.updated_at ?? ''),

  };

}



export function normalizePermissionList(payload: unknown): ApiPermission[] {

  if (!Array.isArray(payload)) return [];

  return payload

    .map(normalizePermission)

    .filter((p): p is ApiPermission => p !== null);

}


