import { Controller, Get, Query, Req, Res, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

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

    // Redirect to MercadoPago OAuth page
    // State is the storeId, so we know which store to update in the callback
    const url = `https://auth.mercadopago.com/authorization?client_id=${appId}&response_type=code&platform_id=mp&state=${store.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') storeId: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (!code || !storeId) {
      return res.redirect(`${frontendUrl}/admin/profile?error=invalid_callback`);
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
