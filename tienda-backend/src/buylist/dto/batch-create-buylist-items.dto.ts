import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BatchCreateBuylistItemsDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsArray()
  @IsString({ each: true })
  conditionIds: string[];

  @IsArray()
  @IsString({ each: true })
  languageIds: string[];

  @IsInt()
  @Min(1)
  @IsOptional()
  quantityWanted?: number;

  @IsNumber()
  @Min(0)
  cashPrice: number;

  @IsNumber()
  @Min(0)
  creditPrice: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

