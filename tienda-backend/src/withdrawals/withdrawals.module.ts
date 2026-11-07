import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TaxModule } from '../tax/tax.module';

@Module({
  imports: [PrismaModule, AuthModule, TaxModule],
  providers: [WithdrawalsService],
  controllers: [WithdrawalsController],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
