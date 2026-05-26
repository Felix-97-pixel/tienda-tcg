import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  inventoryItemId?: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateOrderDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;
}
