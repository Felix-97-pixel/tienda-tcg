import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CheckoutPricingService, CheckoutQuote } from './checkout-pricing.service';
import { CheckoutQuoteRequestDto } from './dto/checkout-quote.dto';

@Controller('checkout')
export class TaxController {
  constructor(private readonly checkoutPricing: CheckoutPricingService) {}

  /**
   * Genera la cotización tributaria y financiera previa al pago.
   * Devuelve el desglose exacto de productos, despachos, comisión TapTrade (3% + IVA con gross-up)
   * y el IVA total consolidado para el comprador.
   */
  @Post('quote')
  @HttpCode(HttpStatus.OK)
  async getQuote(@Body() dto: CheckoutQuoteRequestDto): Promise<CheckoutQuote> {
    return this.checkoutPricing.buildQuote(dto.vendorGroups);
  }
}

