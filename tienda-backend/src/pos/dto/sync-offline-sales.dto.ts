import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePosSaleDto } from './create-pos-sale.dto';

export class OfflineSalePayloadDto extends CreatePosSaleDto {
  @IsString()
  offlineId: string;

  @IsOptional()
  @IsString()
  offlineCreatedAt?: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}

export class SyncOfflineSalesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineSalePayloadDto)
  sales: OfflineSalePayloadDto[];
}
