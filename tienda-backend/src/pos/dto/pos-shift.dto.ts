import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenShiftDto {
  @IsString()
  cashierName: string;

  @IsNumber()
  @Min(0)
  initialCash: number;
}

export class CloseShiftDto {
  @IsNumber()
  @Min(0)
  actualCash: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
