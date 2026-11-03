import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PricingService } from './pricing.service';
import { SellerTaxProfileService } from './seller-tax-profile.service';
import { CheckoutPricingService } from './checkout-pricing.service';
import { TaxController } from './tax.controller';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TaxController, AccountingController],
  providers: [
    PricingService,
    SellerTaxProfileService,
    CheckoutPricingService,
    AccountingService,
  ],
  exports: [
    PricingService,
    SellerTaxProfileService,
    CheckoutPricingService,
    AccountingService,
  ],
})
export class TaxModule {}
