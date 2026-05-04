import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
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
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch('inventory/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateInventoryItem(@Param('id') id: string, @Body() body: { price?: number; stock?: number }) {
    return this.productsService.updateInventoryItem(id, body);
  }
}