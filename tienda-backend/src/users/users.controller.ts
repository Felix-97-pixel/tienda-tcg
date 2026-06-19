import { Body, Controller, Get, Patch, Req, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
    return users.map(u => ({ id: u.id, email: u.email, name: u.name }));
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
}
