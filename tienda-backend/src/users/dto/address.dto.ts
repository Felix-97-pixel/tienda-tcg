import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(60)
  alias?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cityCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  regionCode: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(60)
  alias?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(25)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cityCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  regionCode?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
