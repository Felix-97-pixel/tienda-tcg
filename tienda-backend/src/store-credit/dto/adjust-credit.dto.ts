import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreditTransactionType } from '../enums/credit-transaction-type.enum';

/**
 * Nested DTO for each item in a trade-in or purchase transaction.
 * Validated individually via `@ValidateNested({ each: true })`.
 */
class TransactionItemDto {
  @IsNotEmpty()
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    setName?: string;
  };

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  finish?: string;
}

/**
 * DTO for the POST /store-credit/adjust endpoint.
 *
 * Validates all incoming data before it reaches the service layer.
 * Follows the same pattern as `CreateOrderDto` in the payments module.
 */
export class AdjustCreditDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsEnum(CreditTransactionType, {
    message: `type must be one of: ${Object.values(CreditTransactionType).join(', ')}`,
  })
  type: CreditTransactionType;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  @IsOptional()
  itemsData?: TransactionItemDto[];
}
