import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { StoreRole } from '@prisma/client';

export class ManageStoreUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(StoreRole, { message: 'Rol de sucursal inválido (BRANCH_MANAGER, CASHIER)' })
  @IsOptional()
  role?: StoreRole;
}

