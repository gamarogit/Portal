import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (
      this.config.get('DEV_ALLOW_PUBLIC_ASSETS') === '1' ||
      process.env.NODE_ENV !== 'production'
    ) {
      return true;
    }
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const roles = user?.roles ?? [];
    return requiredRoles.some((role) => roles.includes(role));
  }
}
