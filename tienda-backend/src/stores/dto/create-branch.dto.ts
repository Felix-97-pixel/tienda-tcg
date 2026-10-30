import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Ej: "Sucursal Providencia", "Sucursal Viña del Mar"

  @IsString()
  @IsNotEmpty()
  subdomain: string; // Subdominio único para esta sucursal (ej: "bloodmoon-vina")

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  originRegionId?: string;

  @IsString()
  @IsOptional()
  originCommuneId?: string;

  @IsString()
  @IsOptional()
  pickupSchedule?: string;
}

