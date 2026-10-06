import { IsString, IsNumber, IsDateString, IsEnum, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { CouponScope } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  discountPercent: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(CouponScope)
  scope: CouponScope;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsOptional()
  gameIds?: string[];
}
