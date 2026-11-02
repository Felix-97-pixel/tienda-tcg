import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../constants/permissions.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint o clase no exige permisos específicos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('No hay sesión de usuario autenticada.');
    }

    // SuperAdmin de la plataforma posee bypass universal
    if (user.role === 'SUPERADMIN' || user.sessionType === 'SUPERADMIN') {
      return true;
    }

    const userPermissions: string[] = user.permissions || [];
    const missingPermissions = requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm),
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(
        `Acceso denegado: Careces de los permisos requeridos (${missingPermissions.join(', ')}).`,
      );
    }

    return true;
  }
}

