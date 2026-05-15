import { IsString, IsArray, ValidateNested, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUploadItemDto {
  @IsOptional()
  @IsString()
  scryfallId?: string;

  @IsString()
  name: string;

  @IsString()
  expansion: string;

  @IsString()
  rarity: string;

  @IsString()
  collectorNum: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  finishId?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  originalIndex?: number;
}

export class BulkUploadDto {
  @IsString()
  categoryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadItemDto)
  items: BulkUploadItemDto[];
}
