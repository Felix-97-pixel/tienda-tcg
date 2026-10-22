import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const extractJwtFromCookie = (req: Request) => {
      if (!req || !req.cookies) return null;

      const adminToken = req.cookies['admin_access_token'];
      const customerToken = req.cookies['access_token'];

      const url = (req.originalUrl || req.url || '').toLowerCase();
      const referer = (req.headers && (req.headers['referer'] as string) || '').toLowerCase();
      const hasAdminScope = req.headers && req.headers['x-auth-scope'] === 'admin';
      const isFromAdminUi = referer.includes('/admin') || referer.includes('/superadmin');

      // Rutas que son estrictamente de cliente (compras, carrito, checkout público, wishlist de usuario)
      const isCustomerRoute = url.includes('/cart') || 
                              url.includes('/wishlist/user') ||
                              url.includes('/users/me') ||
                              url.includes('/payments/process') ||
                              url.includes('/payments/init-transaction') ||
                              url.includes('/payments/order/') ||
                              url.includes('/my-account');

      // 1. Si la petición especifica scope de administración explícito o el referer proviene del panel admin
      if ((hasAdminScope || isFromAdminUi) && adminToken) {
        return adminToken;
      }

      // 2. Si es una ruta estrictamente de cliente, preferir token de cliente
      if (isCustomerRoute) {
        if (customerToken) return customerToken;
        // Si solo hay token admin en una ruta de cliente, denegar
        return null;
      }

      // 3. Para cualquier otra ruta (inventario, catálogo, productos, configuración, reportes, etc.):
      // Si el usuario tiene sesión de administrador activa, usarla prioritariamente
      if (adminToken) {
        return adminToken;
      }

      // 4. Si no hay token de administrador, usar token de cliente si existe
      if (customerToken) {
        return customerToken;
      }

      return null;
    };

    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno. ¡Crítico para la seguridad!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
