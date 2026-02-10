import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export type UserRole = 'superadmin' | 'admin' | 'patient' | 'educator';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
