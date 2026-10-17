import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemQuoteDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  productName?: string;
}

export class QuoteCartDto {
  @IsString()
  @IsNotEmpty()
  destinationCommune: string;

  @IsOptional()
  @IsString()
  destinationRegion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemQuoteDto)
  cartItems: CartItemQuoteDto[];
}

export class UpdateStoreShippingDto {
  @IsOptional()
  pickupEnabled?: boolean;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsString()
  pickupSchedule?: string;

  @IsOptional()
  @IsString()
  originCommuneId?: string;

  @IsOptional()
  @IsString()
  originRegionId?: string;

  @IsOptional()
  @IsString()
  originCommuneCode?: string;

  @IsOptional()
  @IsString()
  originRegionCode?: string;
}
