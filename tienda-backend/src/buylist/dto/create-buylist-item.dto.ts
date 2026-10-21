import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBuylistItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  conditionId: string;

  @IsString()
  @IsNotEmpty()
  languageId: string;

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
