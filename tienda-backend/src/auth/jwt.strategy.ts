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

      // 1. Si la petición especifica scope de administración explícito
      if (req.headers && req.headers['x-auth-scope'] === 'admin') {
        return adminToken || customerToken || null;
      }

      // 2. Si la ruta es de administración/superadmin
      const url = (req.originalUrl || req.url || '').toLowerCase();
      const isAdminRoute = url.includes('/sync') || 
                           url.includes('/withdrawals') || 
                           url.includes('/price-updater') || 
                           url.includes('/superadmin') ||
                           url.includes('/stores/me') ||
                           url.includes('/admin');

      if (isAdminRoute && adminToken) {
        return adminToken;
      }

      // 3. Para el resto de rutas (tienda pública, carrito, checkout, perfil de comprador)
      if (customerToken) {
        return customerToken;
      }

      // 4. Si solo hay adminToken pero la ruta es típicamente de cliente, NO usar adminToken
      const isCustomerRoute = url.includes('/cart') || 
                              url.includes('/orders') || 
                              url.includes('/payments') ||
                              url.includes('/wishlist/user') ||
                              url.includes('/my-account');
      if (isCustomerRoute) {
        return null;
      }

      return adminToken || null;
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
