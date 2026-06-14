import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('games')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @Roles(Role.SUPERADMIN)
  findAll() {
    return this.gamesService.findAll();
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(@Body() createGameDto: { name: string; logoUrl?: string; isActive?: boolean }) {
    return this.gamesService.create(createGameDto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() updateGameDto: { name?: string; logoUrl?: string; isActive?: boolean }) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}
