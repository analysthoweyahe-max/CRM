export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

export interface ModuleDef {
  key:     string;
  labelAr: string;
  labelEn: string;
  actions: PermissionAction[];
}

export interface RoleDef {
  key:            string;
  nameAr:         string;
  nameEn:         string;
  descriptionAr:  string;
  descriptionEn:  string;
  usersCount:     number;
  isSystem?:      boolean;
}

export type PermissionMatrix = Record<string, Record<string, PermissionAction[]>>;

export interface RoleFormInput {
  nameAr:        string;
  descriptionAr: string;
  permissions:   Record<string, PermissionAction[]>;
}
