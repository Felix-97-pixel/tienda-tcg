import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment } from 'mercadopago';

@Injectable()
export class MercadoPagoProvider {
  private readonly logger = new Logger(MercadoPagoProvider.name);
  readonly payment: Payment;

  constructor(private config: ConfigService) {
    const accessToken = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.warn('MERCADOPAGO_ACCESS_TOKEN no está configurado. Los pagos pueden fallar.');
    }

    // Initialize MercadoPago configuration
    const mpConfig = new MercadoPagoConfig({ 
      accessToken: accessToken || 'TEST-dummy-token',
      options: { timeout: 10000 }
    });

    this.payment = new Payment(mpConfig);
    this.logger.log('MercadoPago configurado correctamente');
  }
}
