//decorateur personalise pour specifier les roles qui peuvent acceder a certaines routes
import { SetMetadata } from '@nestjs/common';
import { Role } from '../schemas/user.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
