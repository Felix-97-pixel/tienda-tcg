import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string; 

  @IsOptional()
  brandId?: string | null;

  @IsOptional()
  price?: number;

  @IsOptional()
  stock?: number;
}
