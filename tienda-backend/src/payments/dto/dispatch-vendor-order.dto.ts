import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
