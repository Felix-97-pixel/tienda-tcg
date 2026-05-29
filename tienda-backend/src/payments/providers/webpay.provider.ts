import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebpayPlus,
  Options,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Environment,
} from 'transbank-sdk';

/**
 * Provider inyectable que encapsula la configuración de Webpay Plus.
 * Compartido por todos los Command Handlers que necesiten interactuar con Transbank.
 */
@Injectable()
export class WebpayProvider {
  private readonly logger = new Logger(WebpayProvider.name);
  readonly transaction: InstanceType<typeof WebpayPlus.Transaction>;

  constructor(private config: ConfigService) {
    const commerceCode = this.config.get<string>('WEBPAY_COMMERCE_CODE');
    const apiKey = this.config.get<string>('WEBPAY_API_KEY');
    const env = this.config.get<string>('WEBPAY_ENV', 'integration');

    if (env === 'production' && commerceCode && apiKey) {
      this.transaction = new WebpayPlus.Transaction(
        new Options(commerceCode, apiKey, Environment.Production),
      );
      this.logger.log('Webpay configurado en modo PRODUCCIÓN');
    } else {
      // Modo integración (testing) — usa credenciales de prueba de Transbank
      this.transaction = new WebpayPlus.Transaction(
        new Options(
          IntegrationCommerceCodes.WEBPAY_PLUS,
          IntegrationApiKeys.WEBPAY,
          Environment.Integration,
        ),
      );
      this.logger.warn('Webpay configurado en modo INTEGRACIÓN (pruebas)');
    }
  }
}
