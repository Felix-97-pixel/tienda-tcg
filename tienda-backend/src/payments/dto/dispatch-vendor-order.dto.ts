import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DispatchVendorOrderDto {
  @IsString()
  @IsNotEmpty()
  courier: string; // e.g. "STARKEN", "CHILEXPRESS", "CORREOS_CHILE", "BLUE_EXPRESS", "RETIRO_TIENDA"

  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @IsString()
  @IsOptional()
  trackingUrl?: string;
}
