import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PosBuyPayoutMethod {
  STORE_CREDIT = 'STORE_CREDIT',
  CASH = 'CASH',
}

export class PosBuyCardItemDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  cashPrice: number;

  @IsNumber()
  @Min(0)
  creditPrice: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  conditionId?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  languageId?: string;

  @IsOptional()
  @IsString()
  finish?: string;

  @IsOptional()
  @IsString()
  finishId?: string;
}

export class PosBuyOperationDto {
  @IsEnum(PosBuyPayoutMethod)
  payoutMethod: PosBuyPayoutMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosBuyCardItemDto)
  items: PosBuyCardItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerRut?: string;

  @IsOptional()
  @IsString()
  cashierName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

