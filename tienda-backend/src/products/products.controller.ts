import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('meta/categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('meta/expansions')
  getExpansions(@Query('category') category?: string) {
    return this.productsService.getExpansions(category);
  }

  @Get('meta/attributes')
  getAttributes(@Query('category') category?: string) {
    return this.productsService.getAttributes(category);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('expansion') expansion?: string,
    @Query('attribute') attribute?: string
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50; // default 50 limits
    return this.productsService.findAll(pageNumber, limitNumber, category, expansion, attribute);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Sin el '+', pasamos el ID como el texto que es
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}