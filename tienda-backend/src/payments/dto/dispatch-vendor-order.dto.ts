import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DispatchVendorOrderDto {
  @IsString()
  @IsOptional()
  courier?: string; // e.g. "STARKEN", "CHILEXPRESS", "CORREOS_CHILE", "BLUE_EXPRESS", "RETIRO_TIENDA"

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  trackingUrl?: string;

  // Evidencias fotográficas de empaque (Protocolo TapTrade Shield)
  @IsString()
  @IsOptional()
  contentPhotoUrl?: string;

  @IsString()
  @IsOptional()
  packagingPhotoUrl?: string;

  @IsString()
  @IsOptional()
  packagePhotoUrl?: string;

  // Documento Tributario Electrónico (DTE) emitido por la tienda al comprador final (Opcional al despachar)
  @IsNumber()
  @IsOptional()
  buyerDteType?: number; // 39 (Boleta Afecta), 41 (Boleta Exenta), 33 (Factura Electrónica)

  @IsString()
  @IsOptional()
  buyerDteFolio?: string;

  @IsString()
  @IsOptional()
  buyerDteUrl?: string;
}
