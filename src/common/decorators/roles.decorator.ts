import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export type UserRole = 'superadmin' | 'admin' | 'patient' | 'educator' | 'super_educator' | 'logistica';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
