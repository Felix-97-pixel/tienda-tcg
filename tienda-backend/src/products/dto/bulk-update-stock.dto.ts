import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUpdateStockItemDto {
  @IsString()
  id: string;

  @IsNumber()
  stock: number;
}

export class BulkUpdateStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateStockItemDto)
  items: BulkUpdateStockItemDto[];
}
