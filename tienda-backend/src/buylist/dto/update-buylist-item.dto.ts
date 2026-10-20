import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBuylistItemDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  quantityWanted?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  creditPrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
