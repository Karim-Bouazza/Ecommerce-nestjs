import { SetMetadata } from '@nestjs/common';
import { Role } from '../enum/role.enum';

export const SELF_OR_ROLES_KEY = 'selfOrRoles';

export const SelfOrRoles = (...roles: Role[]) =>
  SetMetadata(SELF_OR_ROLES_KEY, roles);
