import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreByOwnerDto } from './dto/update-store-by-owner.dto';
import { UpdateStoreFullDto } from './dto/update-store-full.dto';
import { ManageCompanyUserDto } from './dto/manage-company-user.dto';
import { ManageStoreUserDto } from './dto/manage-store-user.dto';
import { UpdateUserCredentialsDto } from './dto/update-user-credentials.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.enum';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('public')
  getPublicStores() {
    return this.storesService.getPublicStores();
  }

  @Get('public/:subdomain')
  getPublicStore(@Param('subdomain') subdomain: string) {
    return this.storesService.getPublicStoreBySubdomain(subdomain);
  }

  @Get('public-by-id/:id')
  getPublicStoreById(@Param('id') id: string) {
    return this.storesService.getPublicStoreById(id);
  }


  @UseGuards(JwtAuthGuard)
  @Get('me/company')
  async getCompany(@Request() req: any) {
    return this.storesService.getCompanyByOwner(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.WALLET_WITHDRAW)
  @Patch('me/company-profile')
  async updateCompanyTaxAndBank(@Request() req: any, @Body() body: any) {
    return this.storesService.updateCompanyTaxAndBankByOwner(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/branches')
  async getBranches(@Request() req: any) {
    return this.storesService.getBranches(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/branches')
  async createBranch(@Request() req: any, @Body() dto: CreateBranchDto) {
    return this.storesService.createBranch(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getStoreByOwner(@Request() req: any) {
    const requestedStoreId = (req.headers['x-store-id'] as string) || req.user.activeStoreId;
    const store = await this.storesService.getStoreByOwner(req.user.userId, requestedStoreId);
    const features = await this.storesService.getStoreFeatures(store.id);
    return { ...store, activeFeatures: features };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/exchange-rates')
  async getExchangeRates(@Request() req: any) {
    const requestedStoreId = (req.headers['x-store-id'] as string) || req.user.activeStoreId;
    return this.storesService.getExchangeRates(req.user.userId, requestedStoreId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/exchange-rates')
  async upsertExchangeRate(@Request() req: any, @Body() data: { gameId: string; rate: number; buyPercentage?: number; creditPercentage?: number }) {
    const requestedStoreId = (req.headers['x-store-id'] as string) || req.user.activeStoreId;
    return this.storesService.upsertExchangeRate(req.user.userId, data, requestedStoreId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/exchange-rates/:id')
  async deleteExchangeRate(@Request() req: any, @Param('id') id: string) {
    const requestedStoreId = (req.headers['x-store-id'] as string) || req.user.activeStoreId;
    return this.storesService.deleteExchangeRate(req.user.userId, id, requestedStoreId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateStoreByOwner(@Request() req: any, @Body() updateDto: UpdateStoreByOwnerDto) {
    const targetStoreId = (req.headers['x-store-id'] as string) || req.user.activeStoreId;
    return this.storesService.updateStoreByOwner(req.user.userId, updateDto, targetStoreId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/devaluations')
  upsertDevaluations(@Request() req: any, @Body() data: { gameId: string, devaluations: { conditionId: string, multiplier: number }[] }) {
    const targetStoreId = (req.headers['x-store-id'] as string) || req.user.activeStoreId;
    return this.storesService.upsertDevaluations(req.user.userId, data.gameId, data.devaluations, targetStoreId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/language-devaluations')
  upsertLanguageDevaluations(@Request() req: any, @Body() data: { gameId: string, languageDevaluations: { languageId: string, multiplier: number }[] }) {
    const targetStoreId = (req.headers['x-store-id'] as string) || req.user.activeStoreId;
    return this.storesService.upsertLanguageDevaluations(req.user.userId, data.gameId, data.languageDevaluations, targetStoreId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get('companies')
  findAllCompanies() {
    return this.storesService.findAllCompanies();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch('companies/:id/plan')
  updateCompanyPlan(@Param('id') id: string, @Body() data: { planId: string | null }) {
    return this.storesService.updateCompanyPlan(id, data.planId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ACCOUNTING_READ)
  @Patch('companies/:id/compliance')
  updateCompanyCompliance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.storesService.updateCompanyComplianceBySuperAdmin(
      id,
      req.user.userId,
      data,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post('companies/:id/branches')
  createBranchForCompany(@Param('id') id: string, @Body() dto: CreateBranchDto) {
    return this.storesService.createBranchForCompany(id, dto);
  }

  // --- Usuarios y Accesos a nivel de Empresa ---
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TEAM_CORPORATE_MANAGE)
  @Get('companies/:id/users')
  getCompanyUsers(@Request() req: any, @Param('id') companyId: string) {
    return this.storesService.getCompanyUsers(companyId, req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TEAM_CORPORATE_MANAGE)
  @Post('companies/:id/users')
  addCompanyUser(@Request() req: any, @Param('id') companyId: string, @Body() dto: ManageCompanyUserDto) {
    return this.storesService.addCompanyUser(companyId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TEAM_CORPORATE_MANAGE)
  @Delete('companies/:id/users/:userId')
  removeCompanyUser(@Request() req: any, @Param('id') companyId: string, @Param('userId') targetUserId: string) {
    return this.storesService.removeCompanyUser(companyId, targetUserId, req.user);
  }

  // --- Personal y Cajeros a nivel de Sucursal ---
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TEAM_LOCAL_MANAGE)
  @Get(':id/users')
  getStoreUsers(@Request() req: any, @Param('id') storeId: string) {
    return this.storesService.getStoreUsers(storeId, req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TEAM_LOCAL_MANAGE)
  @Post(':id/users')
  addStoreUser(@Request() req: any, @Param('id') storeId: string, @Body() dto: ManageStoreUserDto) {
    return this.storesService.addStoreUser(storeId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TEAM_LOCAL_MANAGE)
  @Delete(':id/users/:userId')
  removeStoreUser(@Request() req: any, @Param('id') storeId: string, @Param('userId') targetUserId: string) {
    return this.storesService.removeStoreUser(storeId, targetUserId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get(':id/full')
  async getStoreFull(@Param('id') id: string) {
    const store = await this.storesService.getStoreById(id);
    const features = await this.storesService.getStoreFeatures(store.id);
    return { ...store, activeFeatures: features };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch(':id/full')
  updateStoreFull(@Param('id') id: string, @Body() updateDto: UpdateStoreFullDto) {
    return this.storesService.updateStoreById(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TEAM_CORPORATE_MANAGE)
  @Patch('users/:userId/credentials')
  updateUserCredentials(
    @Request() req: any,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateUserCredentialsDto,
  ) {
    return this.storesService.updateUserCredentials(targetUserId, dto, req.user);
  }
}
