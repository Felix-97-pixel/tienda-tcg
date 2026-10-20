import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(RolesGuard)
  async searchUsers(@Query('query') query: string) {
    if (!query || query.length < 3) return [];
    const users = await this.usersService.searchUsers(query);
    return users.map((u) => ({ id: u.id, email: u.email, name: u.name }));
  }

  /** GET /users/me — Perfil del usuario autenticado */
  @Get('me')
  getProfile(@Req() req: Request & { user: { userId: string } }) {
    return this.usersService.findById(req.user.userId);
  }

  /** PATCH /users/me — Actualizar nombre, teléfono, dirección, ciudad */
  @Patch('me')
  updateProfile(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  /** GET /users/me/orders — Historial de pedidos del usuario */
  @Get('me/orders')
  getMyOrders(@Req() req: Request & { user: { userId: string } }) {
    return this.usersService.getUserOrders(req.user.userId);
  }

  /** ─── ENDPOINTS DE DIRECCIONES MÚLTIPLES ─── */

  /** GET /users/me/addresses — Listado de direcciones del usuario */
  @Get('me/addresses')
  getMyAddresses(@Req() req: Request & { user: { userId: string } }) {
    return this.usersService.getUserAddresses(req.user.userId);
  }

  /** POST /users/me/addresses — Crear una nueva dirección */
  @Post('me/addresses')
  createAddress(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.createAddress(req.user.userId, dto);
  }

  /** PATCH /users/me/addresses/:id — Modificar una dirección existente */
  @Patch('me/addresses/:id')
  updateAddress(
    @Req() req: Request & { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(req.user.userId, id, dto);
  }

  /** PATCH /users/me/addresses/:id/set-default — Establecer dirección como predeterminada */
  @Patch('me/addresses/:id/set-default')
  setDefaultAddress(
    @Req() req: Request & { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.usersService.setDefaultAddress(req.user.userId, id);
  }

  /** DELETE /users/me/addresses/:id — Eliminar una dirección */
  @Delete('me/addresses/:id')
  deleteAddress(
    @Req() req: Request & { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.usersService.deleteAddress(req.user.userId, id);
  }

  /** ─── ENDPOINTS DE CRÉDITOS DE TIENDA ─── */

  /** GET /users/me/store-credits — Listado de saldos a favor en tiendas */
  @Get('me/store-credits')
  getMyStoreCredits(@Req() req: Request & { user: { userId: string } }) {
    return this.usersService.getUserStoreCredits(req.user.userId);
  }

  /** GET /users/me/store-credits/transactions — Movimientos e historial de créditos */
  @Get('me/store-credits/transactions')
  getMyCreditTransactions(@Req() req: Request & { user: { userId: string } }) {
    return this.usersService.getUserCreditTransactions(req.user.userId);
  }
}

