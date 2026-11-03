import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class VendorGroupQuoteDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsNumber()
  @Min(0)
  productsGross: number;

  @IsNumber()
  @Min(0)
  shippingGross: number;
}

export class CheckoutQuoteRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorGroupQuoteDto)
  vendorGroups: VendorGroupQuoteDto[];

  @IsOptional()
  @IsString()
  @IsIn(['WEBPAY', 'MERCADOPAGO'])
  gateway?: 'WEBPAY' | 'MERCADOPAGO';
}
