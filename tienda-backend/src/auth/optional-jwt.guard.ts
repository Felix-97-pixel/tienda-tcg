import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard opcional: si hay token JWT lo valida y llena req.user,
 * pero si no hay token (usuario invitado) deja pasar igual.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, _info: any) {
    // Si hay error o no hay usuario, simplemente devolvemos null (no tiramos excepción)
    if (err || !user) {
      return null;
    }
    return user;
  }
}
