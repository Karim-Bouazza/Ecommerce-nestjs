import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { Role } from '../enum/role.enum';
import { SELF_OR_ROLES_KEY } from '../decorators/self-or-admin.decorator';

@Injectable()
export class SelfOrRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles =
      this.reflector.get<Role[]>(SELF_OR_ROLES_KEY, context.getHandler()) || [];

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const paramId = Number(request.params.id);

    if (user.sub === paramId) {
      return true;
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('Accès refusé.');
  }
}
