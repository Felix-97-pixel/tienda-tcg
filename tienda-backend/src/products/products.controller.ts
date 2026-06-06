import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BulkUploadDto } from './dto/bulk-upload.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  createGlobal(@Body() body: any) {
    // Reutilizamos el servicio para crear desde Scryfall, asegurando categoryId
    return this.productsService.createProductFromScryfallCard(body.scryfallCard, body.categoryId, body);
  }

  @Get('global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  getGlobalProducts(@Query('search') search?: string) {
    // Retornamos los productos sin store (storeId: null)
    return this.productsService.getGlobalProducts(search);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('bulk-upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  bulkUpload(@Body() bulkUploadDto: BulkUploadDto) {
    return this.productsService.bulkUpload(bulkUploadDto.categoryId, bulkUploadDto.items);
  }

  @Post('bulk-update-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  bulkUpdateStock(@Body() bulkUpdateStockDto: any) {
    return this.productsService.bulkUpdateStock(bulkUpdateStockDto.items);
  }

  @Get('meta/categories/admin')
  getAdminCategories() {
    return this.productsService.getAdminCategories();
  }

  @Post('meta/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.productsService.createCategory(createCategoryDto);
  }

  @Get('meta/categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Patch('meta/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.productsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('meta/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.productsService.deleteCategory(id);
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('meta/brands')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createBrand(@Body() body: { name: string; imageUrl?: string }) {
    return this.productsService.createBrand(body);
  }

  @Get('meta/brands')
  getBrands() {
    return this.productsService.getBrands();
  }

  @Patch('meta/brands/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateBrand(@Param('id') id: string, @Body() body: { name?: string; imageUrl?: string }) {
    return this.productsService.updateBrand(id, body);
  }

  @Delete('meta/brands/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteBrand(@Param('id') id: string) {
    try {
      await this.productsService.deleteBrand(id);
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('meta/expansions')
  getExpansions(@Query('category') category?: string) {
    return this.productsService.getExpansions(category);
  }

  @Get('meta/attributes')
  getAttributes(
    @Query('category') category?: string,
    @Query('expansion') expansion?: string,
  ) {
    return this.productsService.getAttributes(category, expansion);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('expansion') expansion?: string,
    @Query('attribute') attribute?: string,
    @Query('search') searchName?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50; // default 50 limits
    return this.productsService.findAll(pageNumber, limitNumber, category, expansion, attribute, searchName);
  }

  @Get('meta/languages')
  getLanguages() {
    return this.productsService.getLanguages();
  }

  @Get('meta/conditions')
  getConditions() {
    return this.productsService.getConditions();
  }

  @Get('meta/finishes')
  getFinishes(@Query('game') game?: string) {
    return this.productsService.getFinishes(game);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Sin el '+', pasamos el ID como el texto que es
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    try {
      await this.productsService.remove(id);
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Patch('inventory/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateInventoryItem(@Param('id') id: string, @Body() body: { price?: number; stock?: number }) {
    return this.productsService.updateInventoryItem(id, body);
  }

  @Delete('inventory/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async removeInventoryItem(@Param('id') id: string) {
    try {
      await this.productsService.removeInventoryItem(id);
      return { success: true };
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':productId/inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  addInventoryItem(@Param('productId') productId: string, @Body() body: any) {
    return this.productsService.addInventoryItem(productId, body);
  }
}