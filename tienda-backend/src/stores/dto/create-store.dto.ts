import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsArray } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Nombre de la Casa Matriz / Primera Sucursal

  @IsString()
  @IsOptional()
  companyName?: string; // Nombre de la Empresa o Holding (ej: "Blood Moon Games SpA")

  @IsString()
  @IsOptional()
  companyRut?: string; // RUT de la Empresa / Holding

  @IsString()
  @IsOptional()
  companyLogoUrl?: string; // Logo corporativo del Holding

  @IsString()
  @IsNotEmpty()
  subdomain: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  games?: string[];

  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @MinLength(6)
  ownerPassword: string;
}
