import { Controller, Get, Query, Req, Res, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('payments/mp')
export class MpOAuthController {
  private readonly logger = new Logger(MpOAuthController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get('connect')
  @UseGuards(JwtAuthGuard)
  async connect(@Req() req: Request & { user: { userId: string } }, @Res() res: Response) {
    const userId = req.user.userId;
    
    // Find the store belonging to this user
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      return res.status(400).send('Store not found for this user');
    }

    const appId = this.config.get<string>('MERCADOPAGO_APP_ID');
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3001/api/v1');
    const redirectUri = `${backendUrl}/payments/mp/callback`;

    if (!appId) {
      this.logger.error('MERCADOPAGO_APP_ID is not configured');
      return res.status(500).send('MERCADOPAGO_APP_ID not configured');
    }

    // Generar un state token firmado criptográficamente para prevenir OAuth State Fixation
    const secret = this.config.get<string>('JWT_SECRET', 'fallback_secret');
    const timestamp = Date.now().toString();
    const payload = `${store.id}:${userId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const secureState = Buffer.from(`${payload}:${hmac}`).toString('base64url');

    const url = `https://auth.mercadopago.com/authorization?client_id=${appId}&response_type=code&platform_id=mp&state=${secureState}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/admin/profile?error=invalid_callback`);
    }

    // Validar firma criptográfica y expiración de 15 minutos en el parámetro state
    const secret = this.config.get<string>('JWT_SECRET', 'fallback_secret');
    let storeId: string;
    try {
      const decoded = Buffer.from(state, 'base64url').toString('utf8');
      const [decodedStoreId, userId, timestampStr, signature] = decoded.split(':');
      if (!decodedStoreId || !userId || !timestampStr || !signature) {
        throw new Error('Malformed state');
      }

      const timestamp = parseInt(timestampStr, 10);
      if (Date.now() - timestamp > 15 * 60 * 1000) {
        throw new Error('State token expired');
      }

      const expectedPayload = `${decodedStoreId}:${userId}:${timestampStr}`;
      const expectedSignature = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');

      if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error('Invalid state signature');
      }

      storeId = decodedStoreId;
    } catch (err: any) {
      this.logger.error(`OAuth state validation failed: ${err.message}`);
      return res.redirect(`${frontendUrl}/admin/profile?error=invalid_oauth_state`);
    }

    const appId = this.config.get<string>('MERCADOPAGO_APP_ID');
    const clientSecret = this.config.get<string>('MERCADOPAGO_CLIENT_SECRET') || this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN'); 
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3001/api/v1');
    const redirectUri = `${backendUrl}/payments/mp/callback`;

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${clientSecret}`,
        },
        body: new URLSearchParams({
          client_secret: clientSecret!,
          client_id: appId!,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          ...(clientSecret?.startsWith('TEST-') ? { test_token: 'true' } : {}),
        }),
      });

      const data = await tokenResponse.json();

      if (!tokenResponse.ok) {
        this.logger.error(`Error exchanging MP code: ${JSON.stringify(data)}`);
        return res.redirect(`${frontendUrl}/admin/profile?error=exchange_failed`);
      }

      // Save credentials in StoreSetting
      const settings = [
        { key: 'MP_ACCESS_TOKEN', value: data.access_token },
        { key: 'MP_PUBLIC_KEY', value: data.public_key },
        { key: 'MP_REFRESH_TOKEN', value: data.refresh_token },
        { key: 'MP_USER_ID', value: String(data.user_id) },
      ];

      // Use a transaction to upsert all settings
      await this.prisma.$transaction(
        settings.map((setting) => 
          this.prisma.storeSetting.upsert({
            where: {
              key_storeId: {
                key: setting.key,
                storeId: storeId,
              },
            },
            update: { value: setting.value },
            create: {
              storeId: storeId,
              key: setting.key,
              value: setting.value,
            },
          })
        )
      );

      this.logger.log(`Mercado Pago linked successfully for store ${storeId}`);
      return res.redirect(`${frontendUrl}/admin/profile?success=mp_linked`);

    } catch (error) {
      this.logger.error('Error in MP callback', error);
      return res.redirect(`${frontendUrl}/admin/profile?error=internal_error`);
    }
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: Request & { user: { userId: string } }) {
    const userId = req.user.userId;
    
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      throw new BadRequestException('Store not found');
    }

    const settings = await this.prisma.storeSetting.findMany({
      where: {
        storeId: store.id,
        key: { in: ['MP_ACCESS_TOKEN', 'MP_USER_ID'] },
      },
    });

    const isConfigured = settings.length >= 2;
    return { isConfigured };
  }
}
