import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserCredentialsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  storeId?: string;
}

