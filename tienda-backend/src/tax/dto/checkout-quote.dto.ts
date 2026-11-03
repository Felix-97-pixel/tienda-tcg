import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

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
}

