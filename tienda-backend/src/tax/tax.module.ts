import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PricingService } from './pricing.service';
import { SellerTaxProfileService } from './seller-tax-profile.service';
import { CheckoutPricingService } from './checkout-pricing.service';
import { TaxController } from './tax.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TaxController],
  providers: [PricingService, SellerTaxProfileService, CheckoutPricingService],
  exports: [PricingService, SellerTaxProfileService, CheckoutPricingService],
})
export class TaxModule {}

