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
import { PosPaymentMethod } from '@prisma/client';

export class PosSaleItemDto {
  @IsString()
  productId: string;

  @IsString()
  inventoryItemId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreatePosSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosSaleItemDto)
  items: PosSaleItemDto[];

  @IsEnum(PosPaymentMethod)
  paymentMethod: PosPaymentMethod;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  receivedAmount?: number; // Monto entregado por el cliente en efectivo

  @IsOptional()
  @IsNumber()
  @Min(0)
  changeAmount?: number; // Vuelto calculado

  @IsOptional()
  @IsString()
  voucherRef?: string; // Voucher / Nº autorización maquinita

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
  userId?: string; // ID usuario registrado para Store Credit

  @IsOptional()
  @IsNumber()
  @Min(0)
  storeCreditAmount?: number;

  @IsOptional()
  @IsString()
  cashierName?: string;
}
