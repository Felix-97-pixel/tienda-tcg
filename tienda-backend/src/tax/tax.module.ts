import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PricingService } from './pricing.service';
import { SellerTaxProfileService } from './seller-tax-profile.service';
import { CheckoutPricingService } from './checkout-pricing.service';
import { TaxController } from './tax.controller';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { FinancialLedgerService } from './financial-ledger.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaxController, AccountingController],
  providers: [
    PricingService,
    SellerTaxProfileService,
    CheckoutPricingService,
    AccountingService,
    FinancialLedgerService,
  ],
  exports: [
    PricingService,
    SellerTaxProfileService,
    CheckoutPricingService,
    AccountingService,
    FinancialLedgerService,
  ],
})
export class TaxModule {}
