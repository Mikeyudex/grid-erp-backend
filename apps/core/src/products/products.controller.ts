import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AttributeConfig } from './interfaces/attribute-config.interface';
import { Product } from './interfaces/products.interface';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'El producto ha sido creado exitosamente.' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente.' })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async delete(@Param('id') id: string): Promise<Product> {
    return this.productService.delete(id);
  }

  // Endpoint para obtener los atributos configurables
  @Get('attributes/config')
  async findAttributeConfigs(): Promise<AttributeConfig[]> {
    return this.productService.findAttributeConfigs();
  }

  // Endpoint para crear un nuevo atributo configurable
  @Post('attributes/config')
  async createAttributeConfig(
    @Body('name') name: string,
    @Body('type') type: string,
    @Body('options') options?: string[],
  ): Promise<AttributeConfig> {
    return this.productService.createAttributeConfig(name, type, options);
  }
}
