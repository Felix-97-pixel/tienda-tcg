import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStoreFullDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  twitter?: string;

  @IsString()
  @IsOptional()
  twitch?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  website?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subscriptionPlanIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customFeatureIds?: string[];

  @IsString()
  @IsOptional()
  subscriptionDiscountType?: string;

  @IsNumber()
  @IsOptional()
  subscriptionDiscountValue?: number;

  @IsString()
  @IsOptional()
  subscriptionNotes?: string;
}
