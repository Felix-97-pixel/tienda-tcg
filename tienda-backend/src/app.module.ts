import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
//Precios Automaticos
import { PriceUpdaterModule } from './price-updater/price-updater.module';
import { ScheduleModule } from '@nestjs/schedule'; // <-- IMPORTANTE
import { SyncModule } from './sync/sync.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PaymentsModule } from './payments/payments.module';
import { SettingsModule } from './settings/settings.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [
    // 1. PRIMERO cargamos la configuración (isGlobal: true lo hace disponible para el resto)
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env' 
    }),
    
    // 2. AHORA ya pueden cargar los módulos que dependen de variables de entorno
    PrismaModule, 
    ProductsModule, 
    ScheduleModule.forRoot(),
    PriceUpdaterModule,
    SyncModule,
    UsersModule,
    AuthModule,
    UploadModule,
    WishlistModule,
    PaymentsModule,
    SettingsModule,
    CurrenciesModule,
    ShippingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}