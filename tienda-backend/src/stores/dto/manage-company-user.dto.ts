import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { CompanyRole } from '@prisma/client';

export class ManageCompanyUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(CompanyRole, { message: 'Rol corporativo inválido (OWNER, ADMIN, ACCOUNTANT)' })
  @IsOptional()
  role?: CompanyRole;
}

